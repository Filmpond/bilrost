'use strict';

/**
 * Alias to simplify the export statements
 */
var exports = module.exports = {};

/**
 *  Export principle bilrost modules
 */
exports.Bilrost = {
  Message: require('./bilrost/message'),
  Worker: require('./bilrost/worker')
};