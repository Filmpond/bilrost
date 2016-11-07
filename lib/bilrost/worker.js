'use strict';

var bus = require('./bus')(),
  nconf = require('nconf'),
  Message = require('./message'),
  winston = require('winston');

/**
 *
 */
module.exports = function(topic, subscriber, callback) {

  /**
   * Set the initial state of the worker.
   */
  var topic = topic;
  var subscriber = subscriber;
  var callback = callback;
  var restartCount = 0;
  var pollOptions = { isPeekLock: true, timeoutIntervalInS: 10 };
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
      winston.log('error', 'Worker crashed, attempting restart...', { topic: topic, subscriber: subscriber });
      winston.log('error', e.message);
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
      winston.log('info', 'Worker stopping...', { topic: topic, subscriber: subscriber });
      clearInterval(intervalId);
    }
  }

  /**
   * Will pick the next message of the Bifrost, invoke the callback and then deleteMessage
   * if the callback does not throw an exception
   */
  function receive() {
    bus.receiveSubscriptionMessage(topic, subscriber, pollOptions, function(error, message) {
      if (error) {
        if (error !== 'No messages to receive') {
          winston.log('error', 'Worker receive failed...', { topic: topic, subscriber: subscriber, error: error });
        }
      } else {
        if (message) {
          var boxedMessage = new Message(decode(message.body), message.brokerProperties);
          winston.log('info', 'Worker received message...', message);
          callback(error, boxedMessage);
          bus.deleteMessage(message, function(error) {
            if (error) {
              winston.log('error', 'Worker delete failed...', { topic: topic, subscriber: subscriber, error: error });
            }
          });
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