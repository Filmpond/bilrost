'use strict';

var bus = require('./bus')(),
  winston = require('winston'),
  BilrostError = require('./errors/bilrost.error');

/**
 * A message can be posted to a topic
 */
module.exports = function(messageParam, propertyParam) {

  /**
   * This library allows undefined messages to be sent to the
   * bifrost
   */
  var message = messageParam || {};
  var properties = propertyParam || {};


  return {
    body: message,
    properties: properties,
    postTo: postTo
  };

  /**
   * Post a message to a specific topic, when the response is received
   * inform any interested parties
   */
  function postTo(topic, callback) {
    bus.sendTopicMessage(topic, encode(message), function(error, response) {
      if (error) {
        winston.log('error', 'Message send failed...', { topic: topic, error: error });
      } else {
        winston.log('info', 'Message sending...', { message: message, response: response });
      }
      callback(error, response);
    });
  }

  /**
   * If the message is an object literal, we encode it as a string
   */
  function encode(payload) {
    if (typeof payload === 'object' && payload !== null) {
      return JSON.stringify(payload);
    } else {
      return payload;
    }
  }
};