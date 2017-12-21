'use strict';

const bus = require('./bus')(),
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
 */
function Worker(topic, subscriber) {
  this.restartCount = 0;
  this.pollOptions = { isPeekLock: true, timeoutIntervalInS: nconf.get('SUBSCRIBER_TIMEOUT') || 30 };
  this.workerSleep = nconf.get('WORKER_SLEEP') || 5000;
  this.intervalId = null;
  this.topic = topic;
  this.subscriber = subscriber;
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
  bus.receiveSubscriptionMessage(this.topic, this.subscriber, this.pollOptions, function(error, message) {
    if (error) {
      if (error !== 'No messages to receive') {
        winston.error('Worker receive failed...', { topic: this.topic, subscriber: this.subscriber, error: error });
      }
    } else {
      // If there is no error, then there should be a message, but we check to make sure
      // for defensive purposes
      if (message && this.callback) {
        var boxedMessage = new Message(decode(message.body), message.brokerProperties);
        winston.info('Worker received message...', message);
        this.callback(boxedMessage)
          .then(() => {
            winston.info('Message successfuly processed and will be deleted...');
            bus.deleteMessage(message, function(error) {
              if (error) {
                winston.error('Message delete failed...', { topic: this.topic, subscriber: this.subscriber, error: error });
              }
            });
          })
          .catch(error => winston.error('Worker failed..', { error: error }));
      }
    }
  });
};

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