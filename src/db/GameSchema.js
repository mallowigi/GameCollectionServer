/**
 * Created by Elior on 06/08/13.
 */
var mongo = require('mongoose');
var config = require('../config');

var GameSchema = mongo.Schema({
	title: String,
	description: String
});