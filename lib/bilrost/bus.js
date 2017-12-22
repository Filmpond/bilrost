'use strict';

const azure = require('azure-sb'),
  nconf = require('nconf');

/**
 * The mock bus is returned during a test cycle. Using a test double
 * appears to be overkill at the outset so we include a very simple
 * implementation for the moment.
 */
const mockBus = function(error, response) {
  /**
   * For the moment we just call the callback with empty data.
   */
  return {
    sendTopicMessage: (topic, _, cb) => cb(error, response),
    receiveSubscriptionMessage: (topic, subscriber, pollOptions, cb) => cb(null, response)
  };
};

/**
 * A bus is an abstraction for the Bifrost
 */
module.exports = function() {
  /**
   * Setup nconf to use (in-order):
   * 1. Environment variables
   * 2. A file located at './config.json'
   */
  nconf.env().file({ file: 'config.test.json' });
  if (nconf.get('ENV') !== 'test') {
    return azure.createServiceBusService(nconf.get('AZURE_SERVICEBUS_CONNECTION_STRING'));
  } else {
    return mockBus;
  }
};