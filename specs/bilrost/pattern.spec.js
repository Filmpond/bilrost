'use strict';

var expect  = require('chai').expect,
    Pattern = require('../../lib/bilrost/pattern'),
    BilrostError = require('../../lib/bilrost/errors/bilrost.error');

describe('Pattern', function() {

  it('should not accept empty topic and subscription', function(done) {
    var pattern = new Pattern('', '');
    expect(pattern.validateExpression('','')).to.throw(BilrostError);
    done();
  });

  it('should not accept empty topic', function(done) {
    expect(new Pattern('', 'subscription')).to.throw(BilrostError);
    done();
  });

  it('should not accept undefined topic', function(done) {
    expect(new Pattern(undefined, 'subscription')).to.throw(BilrostError);
    done();
  });

  it('should not accept null topic', function(done) {
    expect(new Pattern(null, 'subscription')).to.throw(BilrostError);
    done();
  });

  it('should not accept empty subscription', function(done) {
    expect(new Pattern('topic', '')).to.throw(BilrostError);
    done();
  });

  it('should not accept undefined subscription', function(done) {
    expect(new Pattern('topic', undefined)).to.throw(BilrostError);
    done();
  });

  it('should not accept null subscription', function(done) {
    expect(new Pattern('topic', null)).to.throw(BilrostError);
    done();
  });

  it('should be able to reduce a topic and subscription to an expression', function(done) {
    expect(new Pattern('topic', 'subscription').expression()).to.eq('topicsubscription');
    done();
  });
});
