'use strict';

var azure = require('azure-sb');

/**
 *
 */
module.exports = function(bus, topic, subscription, cb) {

  function run() {
    bus.receiveSubscriptionMessage(topic, subscription, processMessage);
  }

  function processMessage(error, message) {
    if (error) {
      // Log the error
    } else {
      cb(message);
    }
  }
};