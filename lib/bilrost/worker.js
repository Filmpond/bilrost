'use strict';

const Bus = require('./bus')(),
  nconf = require('nconf'),
  Message = require('./message'),
  winston = require('winston');

/**
 * A worker is a subscriber which listens for messages for a specific topic and
 * subscriber name. When a message is received the callback is invoked. A callback
 * should have the following function definition function(error, message).
 * @constructor
 * @param {String} topic - Name of the topic that the worker picks up message from.
 * @param {String} subscriber - Name of the subscriber that an instance of a worker is attached to.
 * @param {Function} callback - Function which is invoked when a message is received via the Bifrost. This function
 * needs to return a promise.
 * @param {Object} mockBus - The message object can be given, if it is not given a mock bus it falls back to
 * use the actual Azure message bus.
 */
function Worker(topic, subscriber, callback, mockBus) {
  this.restartCount = 0;
  this.pollOptions = { isPeekLock: true, timeoutIntervalInS: nconf.get('SUBSCRIBER_TIMEOUT') || 30 };
  this.workerSleep = nconf.get('WORKER_SLEEP') || 5000;
  this.intervalId = null;
  this.topic = topic;
  this.subscriber = subscriber;
  this.callback = callback;
  this.bus = mockBus || Bus;
}

/**
 * A worker runs by waking up every so often, checks the subscriber for a message, if one exists
 * it invokes the callback else goes back to sleep only to awake later again.
 */
Worker.prototype.run = function() {
  try {
    this.intervalId = setInterval(this.receive, this.workerSleep);
  } catch (e) {
    // Attempt a restart, but give up after 10 attempts
    winston.error('Worker crashed, attempting restart...', { topic: this.topic, subscriber: this.subscriber });
    winston.error(e.message);
    this.restartCount++;
    if (this.restartCount < 10) {
      run();
    }
  }
};

/**
 * The worker can be explicitly terminated.
 */
Worker.prototype.terminate = function() {
  if (this.intervalId) {
    winston.info('Worker stopping...', { topic: this.topic, subscriber: this.subscriber });
    clearInterval(this.intervalId);
  }
};

/**
 * Will pick the next message of the Bifrost. TODO:
 */
Worker.prototype.receive = function() {
  winston.debug(`Worker ${this.topic} - ${this.subscriber} waking up...`);
  this.bus
    .receiveSubscriptionMessage(this.topic, this.subscriber, this.pollOptions, (error, message) => {
      if (error) {
        if (error !== 'No messages to receive') {
          winston.error('Worker receive failed...', { topic: this.topic, subscriber: this.subscriber, error: error });
        }
      } else {
        boxMessageAndInvokeCallback.call(this, message);
      }
    });
};

/**
 * If there is no error, then there should be a message, but we check to make sure
 * for defensive purposes
 * @param {Object} message - Message object received from the Bifrost.
 */
function boxMessageAndInvokeCallback(message) {
  let handleDeleteError = error => {
    if (error) {
      winston.error('Message delete failed...', { topic: this.topic, subscriber: this.subscriber, error: error });
    }
  };
  if (message && this.callback) {
    let boxedMessage = new Message(decode(message.body), message.brokerProperties);
    winston.info('Worker received message...', message);
    this.callback(boxedMessage)
      .then(() => {
        winston.info('Message successfuly processed and will be deleted...');
        this.bus.deleteMessage(message, handleDeleteError);
      })
      .catch(error => winston.error('Worker failed..', { error: error }));
  }
}

/**
 * If the message is an object literal, we encode it as a string
 */
function decode(payload) {
  try {
    return JSON.parse(payload);
  } catch (e) {
    return payload;
  }
}

module.exports = Worker;