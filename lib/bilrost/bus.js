'use strict';

var azure = require('azure-sb'),
  nconf = require('nconf');

/**
 * A bus is an abstraction for the Bifrost
 */
module.exports = function() {
  /**
   * Setup nconf to use (in-order):
   * 1. Environment variables
   * 2. A file located at './config.json'
   */
  nconf.env().file({ file: 'config.json' });
  return azure.createServiceBusService(nconf.get('AZURE_SERVICEBUS_CONNECTION_STRING'));
};