'use strict';

var common  = require('../specs.common')()
  , nconf = require('nconf')
  , bus = require('../../lib/bilrost/bus')()
  , expect  = require('chai').expect
  , Message = require('../../lib/bilrost/message')
  , Worker = require('../../lib/bilrost/worker');

describe('Worker', function() {

  this.timeout(200000); // We set a higher timeout just for this spec

  var topicName = 'worker-test-topic';
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

  context('when WORKER_SLEEP is not set', function() {
    beforeEach(function(done) {
      nconf.set('WORKER_SLEEP', undefined);
      done();
    });

    it('should return a default of 5000', function(done) {
      var worker = new Worker(topicName, subscriberName, done);
      expect(worker.workerSleep).to.equal(5000);
      done();
    })
  });

  context('when WORKER_SLEEP is set', function() {
    beforeEach(function(done) {
      nconf.set('WORKER_SLEEP', 10000);
      done();
    });

    it('should return the set value of 10000', function(done) {
      var worker = new Worker(topicName, subscriberName, done);
      expect(worker.workerSleep).to.equal(10000);
      done();
    })
  });

  context('for a valid topic and subscriber', function() {

    context('where an object literal is published', function() {

      beforeEach(function(done) {
        var msg = new Message({ content: 'some_data' });
        msg.postTo(topicName, done);
      })

      it('should receive a literal once', function(done) {

        var worker = new Worker(topicName, subscriberName, callback);
        worker.receive();

        function callback(message) {
          expect(message).to.exist;
          expect(message.body.content).to.equal('some_data');
          expect(message.properties.DeliveryCount).to.equal(1);
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

      beforeEach(function(done) {
        var msg = new Message('wow');
        msg.postTo(topicName, done);
      })

      it.only('should receive a string once', function(done) {

        var worker = new Worker(topicName, subscriberName, callback);
        worker.receive();

        function callback(message) {
          expect(message).to.exist;
          expect(message.body).to.equal('wow');
          expect(message.properties.DeliveryCount).to.equal(1);
          done();
        }
      });
    });
  });
});
