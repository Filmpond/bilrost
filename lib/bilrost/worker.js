'use strict';

var bus = require('./bus')(),
  nconf = require('nconf'),
  Message = require('./message'),
  winston = require('winston');

/**
 * A worker is a subscriber which listens for messages for a specific topic and
 * subscriber name. When a message is received the callback is invoked. A callback
 * should have the following function definition function(error, message)
 * @constructor
 */
module.exports = function(topic, subscriber, callback) {

  /**
   * Set the initial state of the worker.
   */
  var topic = topic;
  var subscriber = subscriber;
  var callback = callback;
  var restartCount = 0;
  var pollOptions = { isPeekLock: true, timeoutIntervalInS: nconf.get('SUBSCRIBER_TIMEOUT') || 30 };
  var workerSleep = nconf.get('WORKER_SLEEP') || 5000;
  var intervalId;

  return {
    run: run,
    terminate: terminate,
    receive: receive,
    workerSleep: workerSleep
  };

  /**
   * A worker runs by waking up every so often, checks the subscriber for a message, if one exists
   * it invokes the callback else goes back to sleep only to awake later again
   */
  function run() {
    try {
      intervalId = setInterval(receive, workerSleep);
    } catch (e) {
      // Attempt a restart, but give up after 10 attempts
      winston.error('Worker crashed, attempting restart...', { topic: topic, subscriber: subscriber });
      winston.error(e.message);
      restartCount++;
      if (restartCount < 10) {
        run();
      }
    }
  }

  /**
   * The worker can be explicitly terminated
   */
  function terminate() {
    if (intervalId) {
      winston.info('Worker stopping...', { topic: topic, subscriber: subscriber });
      clearInterval(intervalId);
    }
  }

  /**
   * Will pick the next message of the Bifrost, invoke the callback and then deleteMessage
   * if the callback does not throw an exception
   */
  function receive() {
    winston.info('Worker ' + topic + '-' + subscriber + ' waking up...');
    bus.receiveSubscriptionMessage(topic, subscriber, pollOptions, function(error, message) {
      if (error) {
        if (error !== 'No messages to receive') {
          winston.error('Worker receive failed...', { topic: topic, subscriber: subscriber, error: error });
        }
      } else {
        // If there is no error, then there should be a message, but we check to make sure
        // for defensive purposes
        if (message) {
          var boxedMessage = new Message(decode(message.body), message.brokerProperties);
          winston.info('Worker received message...', message);
          // The callback should return a truthy value for the message to be deleted
          if (callback(boxedMessage)) {
            winston.info('Message successfuly processed and will be deleted...');
            bus.deleteMessage(message, function(error) {
              if (error) {
                winston.error('Worker delete failed...', { topic: topic, subscriber: subscriber, error: error });
              }
            });
          }
        }
      }
    });
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
};