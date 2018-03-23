'use strict';

require('dotenv').config();

const winston = require('winston');

/**
 * Global configuration for the specs/tests
 */
module.exports = function() {
  try {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.File, { filename: 'test.log' });
  }
  catch (e) {
    winston.error(e.message);
  }
};
