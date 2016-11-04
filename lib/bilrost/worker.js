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
  var pollOptions = { isPeekLock: true, timeoutIntervalInS: 30 };
  var workerSleep = nconf.get('WORKER_SLEEP') || 5000;

  return {
    run: run,
    receive: receive,
    workerSleep: workerSleep
  };

  /**
   * A worker runs by waking up every so often, checks the subscriber for a message, if one exists
   * it invokes the callback else goes back to sleep only to awake later again
   */
  function run() {
    try {
      setInterval(receive, workerSleep);
    } catch (e) {
      winston.log('error', e.message);
    } finally {
      // Attempt a restart, but give up after 3 attempts
      winston.log('error', 'Worker { topic: ' + topic + ', subscriber: ' + subscriber + '} crashed, attempting restart...');
      restartCount++;
      if (restartCount <= 3) {
        run();
      }
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
          winston.log('error', generateErrorMessage('bus receiveSubscriptionMessage failed'), error);
        }
      } else {
        callback(error, new Message(message.body));
        bus.deleteMessage(message, function(error) {
          if (error) {
            winston.log('error', generateErrorMessage('bus deleteMessage failed'), error);
          }
        });
      }
    });
  }

  /**
   * Simple utility to generate an error message for the winston log
   */
  function generateErrorMessage(baseError) {
    return baseError + ' for topic ' + topic + ' subscriber ' + subscriber;
  }
};