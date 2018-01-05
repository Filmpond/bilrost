'use strict';

require('../specs.common')();

var nconf = require('nconf')
  , MockBus = require('../../lib/bilrost/bus')()
  , expect  = require('chai').expect
  , Message = require('../../lib/bilrost/message')
  , Worker = require('../../lib/bilrost/worker');

describe('Worker', function() {

  let topicName = 'worker-test-topic';
  let subscriberName = 'test-subscription';

  /*
  it.skip('should be able to publish and receive with no peekLock', done => {
    let msg = new Message({ test: 'data' }, {});
    msg.postTo('test-topic', done);
    let worker = new Worker('test-topic', 'test-subscriber', { non_repeatable: false }, callback);
    worker.receive();
    function callback(response) {
      expect(response).to.exist;
      done();
    }
  });*/

  context('when WORKER_SLEEP is not set', function() {
    beforeEach(done => {
      nconf.set('WORKER_SLEEP', undefined);
      done();
    });

    it('should return a default of 5000', done => {
      let worker = new Worker(topicName, subscriberName, {}, done);
      expect(worker.workerSleep).to.equal(5000);
      done();
    });
  });

  context('when WORKER_SLEEP is set', function() {
    beforeEach(done => {
      nconf.set('WORKER_SLEEP', 10000);
      done();
    });

    it('should return the set value of 10000', done => {
      let worker = new Worker(topicName, subscriberName, {}, done);
      expect(worker.workerSleep).to.equal(10000);
      done();
    });
  });

  context('when no options are passed in', function() {
    it('should set peekLock to true', done => {
      let worker = new Worker(topicName, subscriberName, {}, done);
      expect(worker.getOptions({}).isPeekLock).to.be.true;
      done();
    });
  });

  context('when options are passed in', function() {
    it('should allow peekLock to be settable', done => {
      let worker = new Worker(topicName, subscriberName, {}, done);
      expect(worker.getOptions({ non_repeatable: false }).isPeekLock).to.be.false;
      done();
    });
  });

  context('for a valid topic and subscriber', function() {

    context('where an object literal is published', function() {

      let response = { body: { content: 'some_data' }, brokerProperties: { DeliveryCount: 1 } };
      let mockBus = MockBus(null, response);

      beforeEach(function(done) {
        let msg = new Message('test_message', {}, mockBus);
        msg.postTo(topicName, done);
      });

      it('should receive a literal once', done => {

        let worker = new Worker(topicName, subscriberName, {}, callback, mockBus);
        worker.receive();

        function callback(response) {
          expect(response).to.exist;
          expect(response.body.content).to.equal('some_data');
          expect(response.brokerProperties.DeliveryCount).to.equal(1);
          done();
        }
      });

      it.skip('should be terminatable', function(done) {

        var worker = new Worker(topicName, subscriberName, callback);
        console.log('Running worker 1');
        worker.run();

        function callback(message) {
          expect(message).to.exist;
          worker.terminate();
          done();
        }
      });
    });

    context('where a string is published', function() {

      let response = { body: 'wow', brokerProperties: { DeliveryCount: 1 } };
      let mockBus = MockBus(null, response);

      beforeEach(function(done) {
        let msg = new Message('test_message', {}, mockBus);
        msg.postTo(topicName, done);
      });

      it('should receive a string once', function(done) {

        let worker = new Worker(topicName, subscriberName, {}, callback, mockBus);
        worker.receive();

        function callback(response) {
          expect(response).to.exist;
          expect(response.body).to.equal('wow');
          expect(response.brokerProperties.DeliveryCount).to.equal(1);
          done();
        }
      });
    });
  });
});
