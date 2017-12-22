'use strict';

require('../specs.common')();

const MockBus = require('../../lib/bilrost/bus')(),
  expect  = require('chai').expect,
  Message = require('../../lib/bilrost/message');

describe('Message', function() {

  let topicName = 'message-test-topic';

  it('with no content should initialise to an empty literal', done => {
    let msg = new Message();
    expect(msg.body).to.deep.equal({});
    done();
  });

  it('with null should initialise to an empty literal', done => {
    let msg = new Message(null);
    expect(msg.body).to.deep.equal({});
    done();
  });

  it('should not be postable to an invalid topic', done => {
    let mockBus = MockBus({ error: 'some error' }, null, null);
    let msg = new Message({ content: 'some_data' }, mockBus);
    msg.postTo('invalid-topic', error => {
      expect(error).to.exist;
      done();
    });
  });

  it('should be postable to a valid topic', function(done) {
    let mockBus = MockBus(null, null, {});
    let msg = new Message('some_data', mockBus);
    msg.postTo(topicName, (error, response) => {
      expect(error).to.not.exist;
      expect(response).to.exist;
      done();
    });
  });
});
