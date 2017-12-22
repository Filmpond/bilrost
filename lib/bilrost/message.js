'use strict';

const winston = require('winston');
const Bus = require('./bus')();

/**
 * A message is an object with data that can be travel along the Bifrost.
 * @constructor
 * @param {Object} message - Object literal which is serialised to JSON and transported on the Bifrost.
 * @param {Object} brokerProperties - A message can have meta data added to it which relate to the transport, this
 * is used in particular when a message is received from the message bus.
 * @param {Object} mockBus - The message object can be given, if it is not given a mock bus it falls back to
 * use the actual Azure message bus.
 */
function Message(content, brokerProperties, mockBus) {
  this.body = content || {};
  this.brokerProperties = brokerProperties || {};
  this.bus = mockBus || Bus;
}

/**
 * Post a message to a specific topic, when the response is received
 * inform any interested parties.
 * @param {String} topic - Name of the topic.
 * @param {Function} callback - Function to invoke after the message is posted to the Bifrost.
 */
Message.prototype.postTo = function(topic, callback) {
  this.bus.sendTopicMessage(topic, encode(this.body), (error, response) => {
    if (error) {
      winston.error('Message send failed...', { topic: topic, error: error });
    } else {
      winston.info('Message sending...', { message: this.body, response: response });
    }
    if (callback) {
      callback(error, response);
    }
  });
};

/**
 * If the message is an object literal, we encode it as a string.
 * @param {Object} payload - Object liternal which is converted to JSON for transport.
 * @returns {String} JSON or native string representation of payload
 */
function encode(payload) {
  if (payload !== null && typeof payload === 'object') {
    return JSON.stringify(payload);
  } else {
    return payload;
  }
}

module.exports = Message;