/**
 * Created by Elior on 11/08/13.
 */
var mongoose = require('mongoose'),
	bcrypt = require('bcryptjs'),
	config = require('../config'),
	uniqueValidator = require('mongoose-unique-validator');

var UserSchema = mongoose.Schema({
	userName: {
		type: String,
		required: true,
		index: {unique: true}
	},
	password: {
		type: String,
		required: true
	},
	realName: String,
	description: String,
	email: {
		type: String,
		required: true,
		unique: true
	},
	registerDate: {
		type: Date,
		default: Date.now()
	},
	friends: [UserSchema]
});

// Unique validator plugin
UserSchema.plugin(uniqueValidator, {mongoose: mongoose});

/**
 * Email Validation
 * @param email
 */
var validateEmail = function (email) {
	// I'm sure there are already libraries that does this but whatever
	var regex = /^([\.\w-]+@([\w-]+\.)+[\w-]{2,4})?$/
	return regex.test(email);
}
UserSchema.path('email').validate(validateEmail, 'Invalid email');

// Use save middleware for password encryption
// Source: http://blog.mongodb.org/post/32866457221/password-authentication-with-mongoose-part-1
UserSchema.pre('save', function (next) {
	var user = this;

	user.validate(function (err) {
		if (err) return next(err);
	});
	// If the user hasnt changed his data, dont do anything
	if (!user.isModified()) {
		return next();
	}
	// Generate a salt everytime
	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		})
	})
});

/**
 * Compare a given password with the current password and execute a callback with the match
 * @param password the password (clear)
 * @param callback the callback executed to the match result
 */
UserSchema.methods.comparePassword = function (password, callback) {
	bcrypt.compare(password, this.password, function (err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	})
}

var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;

new UserModel({
	userName: 'hello',
	password: 'crap',
	email: 'helio@free.fr'
}).update();