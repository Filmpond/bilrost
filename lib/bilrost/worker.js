'use strict';

var bus = require('./bus')(),
  winston = require('winston');

/**
 *
 */
module.exports = function(topic, subscription) {

  var topic = topic;
  var subscription = subscription;

  return {
    receive: receive
  };

  /**
   * Will pick the next message of the Bifrost, invoke the callback and then deleteMessage
   * if the callback does not throw an exception
   */
  function receive(callback) {
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
};