'use strict';

var expect = require('chai').expect;
var numFormatter = require('../index');

describe('#numFormatter', function() {
    it('should sum numbers', function() {
        var result = sum(1,1);
        expect(result).to.equal(2);
    });
});