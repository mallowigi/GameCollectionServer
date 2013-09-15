/**
 * Created by Elior on 21/08/13.
 */
var assert = require('chai').assert,
	should = require('chai').should;

var router = require('../src/router'),
	config = require('../src/config');
var request = require('supertest');

describe("Testing router", function () {
	describe("Testing session", function () {
		it("should return a session", function (done) {
			request(config.url)
				.get('/api/session')
				.end(function (err, res) {
					res.should.have.status(200);
				});
		});
	});
});