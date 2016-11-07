'use strict';

var winston = require('winston');

module.exports = function() {
  try {
    winston.remove(winston.transports.Console);
    winston.remove(winston.transports.File);
    winston.remove(winston.transports.Http);
    winston.remove(winston.transports.Memory);
    winston.add(winston.transports.File, { filename: 'test.log' });
  }
  catch (e) {
  }
};
