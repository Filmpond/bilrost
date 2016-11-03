'use strict';

var bus = require('./bus')(),
  BilrostError = require('./errors/bilrost.error');

/**
 * A message can be posted to a topic
 */
module.exports = function(message) {

  /**
   * This library allows undefined messages to be sent to the
   * bifrost
   */
  var message = message;
  if (!message) {
    message = {};
  }

  return {
    body: message,
    postTo: postTo
  };

  /**
   * Post a message to a specific topic, when the response is received
   * inform any interested parties
   */
  function postTo(topic, callback) {
    bus.sendTopicMessage(topic, message, function(error, response) {
      // TODO: Log error and response
      callback(error, response);
    });
  }
};