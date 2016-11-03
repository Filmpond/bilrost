'use strict';

var nconf = require('nconf'),
  expect  = require('chai').expect,
  Message = require('../../lib/bilrost/message'),
  Worker = require('../../lib/bilrost/worker');

describe('Worker', function() {

  it('should be able to receive a valid message', function(done) {
    var msg = new Message('some_data');
    msg.postTo('topic', done);
    var worker = new Worker('topic', 'subscriber', done);
    worker.receive();
  });
});
