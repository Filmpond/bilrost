'use strict';

const bus = require('./bus')(),
  winston = require('winston');

/**
 * A message is an object with data that can be travel along the Bifrost.
 * @constructor
 * @param {Object} messageParam - Object literal which is serialised to JSON and transported on the Bifrost.
 */
function Message(messageParam) {
  this.message = messageParam || {};
}

/**
 * Post a message to a specific topic, when the response is received
 * inform any interested parties.
 * @param {String} topic - Name of the topic.
 * @param {Function} callback - Function to invoke after the message is posted to the Bifrost.
 */
Message.prototype.postTo = function(topic, callback) {
  bus.sendTopicMessage(topic, encode(this.message), function(error, response) {
    if (error) {
      winston.error('Message send failed...', { topic: topic, error: error });
    } else {
      winston.info('Message sending...', { message: this.message, response: response });
    }
    callback(error, response);
  });
};

/**
 * If the message is an object literal, we encode it as a string.
 * @param {Object} payload - Object liternal which is converted to JSON for transport.
 */
function encode(payload) {
  if (typeof payload === 'object' && payload !== null) {
    return JSON.stringify(payload);
  } else {
    return payload;
  }
}

module.exports = Message;