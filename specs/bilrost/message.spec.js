'use strict';

var common  = require('../specs.common')();
var nconf = require('nconf'),
    bus = require('../../lib/bilrost/bus')(),
    expect  = require('chai').expect,
    Message = require('../../lib/bilrost/message'),
    BilrostError = require('../../lib/bilrost/errors/bilrost.error');

describe('Message', function() {

  this.timeout(200000); // We set a higher timeout just for this spec

  var topicName = 'message-test-topic';
  var subscriberName = 'test-subscription';

  before(function(done) {
    setTimeout(function() {
      bus.createTopicIfNotExists(topicName, function(error) {
        bus.createSubscription(topicName, subscriberName, function(error) {
          done();
        });
      });
    }, 2000);
  })

  after(function(done) {
    bus.deleteTopic(topicName, function(error) {
      done();
    });
  });

  it('with no content should initialise to an empty literal', function(done) {
    var msg = new Message();
    expect(msg.body).to.deep.equal({});
    done();
  });

  it('with null should initialise to an empty literal', function(done) {
    var msg = new Message(null);
    expect(msg.body).to.deep.equal({});
    done();
  });

  it('should not be postable to an invalid topic', function(done) {

    var msg = new Message({ content: 'some_data' });
    msg.postTo('invalid-topic', callback);

    function callback(error, response) {
      expect(error).to.exist;
      done();
    }
  });

  it('should be postable to a valid topic', function(done) {

    var msg = new Message('some_data');
    msg.postTo(topicName, callback);

    function callback(error, response) {
      expect(error).to.not.exist;
      expect(response).to.exist;
      done();
    }
  });
});
