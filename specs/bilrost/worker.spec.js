'use strict';

var nconf = require('nconf'),
  bus = require('../../lib/bilrost/bus')(),
  expect  = require('chai').expect,
  Message = require('../../lib/bilrost/message'),
  Worker = require('../../lib/bilrost/worker');

describe('Worker', function() {
  this.timeout(200000);

  var topicName = 'test-topic';
  var subscriberName = 'test-subscription';

  beforeEach(function(done) {
    bus.createTopicIfNotExists(topicName, function(error) {
      bus.createSubscription(topicName, subscriberName, function(error) {
        var msg = new Message('some_data');
        msg.postTo(topicName, done);
      });
    });
  })

  // afterEach(function(done) {
  //   bus.deleteTopic(topicName, function(error) {
  //     done();
  //   });
  // });

  context('when the WORKER_SLEEP is not set', function() {
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

  context('when the WORKER_SLEEP is set', function() {
    beforeEach(function(done) {
      nconf.set('WORKER_SLEEP', 10000);
      done();
    });

    it('should return a default of 10000', function(done) {
      var worker = new Worker(topicName, subscriberName, done);
      expect(worker.workerSleep).to.equal(10000);
      done();
    })
  });

  context('for a valid topic and subscriber', function() {
    context('where a message is published once only', function() {

      it('should receive a valid message once only', function(done) {
        var messageCount = 0;
        function callback(error, message) {
          messageCount++;
          expect(error).to.not.exist;
          expect(message).to.exist;
          expect(message.body).to.equal('some_data');
          expect(messageCount).to.equal(1);
          done();
        }
        var worker = new Worker(topicName, subscriberName, callback);
        worker.receive();
      });
    });

    context.only('where a message is published twice', function() {

      beforeEach(function(done) {
        var msg = new Message('more_data');
        msg.postTo(topicName, done);
      });

      it('should receive a valid message twice', function(done) {

        function callback(error, message) {
          console.log('Message received: ' + JSON.stringify(message));
          expect(error).to.not.exist;
          expect(message).to.exist;
        }
        var worker = new Worker(topicName, subscriberName, callback);
        worker.run();
      });
    });
  });
});
