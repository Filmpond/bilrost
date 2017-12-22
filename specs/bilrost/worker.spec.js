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

  context('when WORKER_SLEEP is not set', function() {
    beforeEach(done => {
      nconf.set('WORKER_SLEEP', undefined);
      done();
    });

    it('should return a default of 5000', done => {
      let worker = new Worker(topicName, subscriberName, done);
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
      let worker = new Worker(topicName, subscriberName, done);
      expect(worker.workerSleep).to.equal(10000);
      done();
    });
  });

  context('for a valid topic and subscriber', function() {

    context('where an object literal is published', function() {

      let response = { body: { content: 'some_data' }, brokerProperties: { DeliveryCount: 1 } };
      let mockBus = MockBus(null, response);

      beforeEach(function(done) {
        let msg = new Message(response, { DeliveryCount: 1 }, mockBus);
        msg.postTo(topicName, done);
      });

      it('should receive a literal once', done => {

        let worker = new Worker(topicName, subscriberName, callback, mockBus);
        worker.receive();

        function callback(message) {
          expect(message).to.exist;
          expect(message.body.content).to.equal('some_data');
          expect(message.brokerProperties.DeliveryCount).to.equal(1);
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
        let msg = new Message('wow', { DeliveryCount: 1 }, mockBus);
        msg.postTo(topicName, done);
      });

      it('should receive a string once', function(done) {

        let worker = new Worker(topicName, subscriberName, callback, mockBus);
        worker.receive();

        function callback(message) {
          expect(message).to.exist;
          expect(message.body).to.equal('wow');
          expect(message.brokerProperties.DeliveryCount).to.equal(1);
          done();
        }
      });
    });
  });
});
