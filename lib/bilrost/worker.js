'use strict';

var bus = require('./bus')(),
  winston = require('winston');

/**
 *
 */
module.exports = function(topic, subscription, callback) {

  var topic = topic;
  var subscription = subscription;
  var callback = callback;
  var restartCount = 0;

  return {
    run: run,
    receive: receive
  };

  /**
   * A worker runs by waking up every so often, checks the subscription for a message, if one exists
   * it invokes the callback else goes back to sleep only to awake later again
   */
  function run() {
    try {
      setInterval(receive, workerSleep());
    } catch (ex) {
      winston.log('error', ex.message);
      // Attempt a restart, but give up after 3 attempts
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
    bus.receiveSubscriptionMessage(topic, subscription, function(error, message) {
      if (error) {
        winston.log('error', generateErrorMessage('bus receiveSubscriptionMessage failed'), error);
      } else {
        callback(error, message);
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
    return baseError + ' for topic ' + topic + ' subscription ' + subscription;
  }

  function workerSleep() {
    var workerSleep = nconf.get('WORKER_SLEEP');
    if (workerSleep) {
      return workerSleep;
    } else {
      return 2000;
    }
  }
};