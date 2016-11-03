'use strict';

var nconf = require('nconf');

var expect  = require('chai').expect,
    Message = require('../../lib/bilrost/message'),
    BilrostError = require('../../lib/bilrost/errors/bilrost.error');

describe('Message', function() {

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
    msg.postTo('invalid-topic', done);
  });

  it('should be postable to a valid topic', function(done) {
    var msg = new Message('some_data');
    msg.postTo('topic', done);
  });
});
