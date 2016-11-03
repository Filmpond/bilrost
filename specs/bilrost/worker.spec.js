'use strict';

var nconf = require('nconf');

var expect  = require('chai').expect,
    Worker = require('../../lib/bilrost/worker');

describe('Worker', function() {

  it('should be able to receive a message', function(done) {
    var worker = new Worker('topic', 'subscriber');
    worker.receive(done);
  });
});
