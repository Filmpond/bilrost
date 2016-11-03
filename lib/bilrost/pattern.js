'use strict';

var BilrostError = require('./errors/bilrost.error');

/**
 * A pattern is a mailbox address used by the manager to route a message to a worker inbox
 */
module.exports = function(topic, subscription) {

  /**
   * Pre-condition validation
   */
  validateExpression(topic, subscription);

  var topic = topic;
  var subscription = subscription;

  return {
    expression: expression,
    validateExpression: validateExpression
  };

  /**
   * A pattern can be expressed as an expression, this expression is what we will
   * use to construct a mailbox address
   */
  function expression() {
    return topic.toLowerCase() + subscription.toLowerCase();
  }

  /**
   * Validate topic and subscription
   */
  function validateExpression(topic, subscription) {
    if (!topic || !subscription) {
      throw new BilrostError('Invalid pattern');
    }
  }
};