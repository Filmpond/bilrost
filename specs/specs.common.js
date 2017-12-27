'use strict';

const winston = require('winston');
const nconf = require('nconf');

/**
 * Global configuration for the specs/tests
 */
module.exports = function() {
  try {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.File, { filename: 'test.log' });
    /**
     * Setup nconf to use (in-order):
     * 1. Command-line arguments
     * 2. A file located at './config.test.json'
     */
    nconf.argv().file({ file: 'config.test.json' });
  }
  catch (e) {
    winston.error(e.message);
  }
};
