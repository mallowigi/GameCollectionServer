var UserModel = require('./models/UserSchema');

exports.initRoutes = function (server) {
	server.get('/api/session', function (req, res) {
		console.log("Retrieve a session");
		// This checks the current users auth
		// It runs before Backbones router is started
		// we should return a csrf token for Backbone to use
		if (typeof req.session.username !== 'undefined') {
			console.log("Session Auth passed, SessionID" + req.session.id);
			res.send({
				auth: true,
				id: req.session.id,
				username: req.session.username,
				_csrf: req.session._csrf
			});
		}
		else {
			console.log("Session Auth failed no username")
			res.send({
				auth: false,
				_csrf: req.session._csrf
			});
		}
	});
	server.post('/api/session', function (req, res) {
		console.log("Login request received from " + req.body.username);
		// Here you would pull down your user credentials and match them up to the request
		req.session.username = req.body.username;

		res.send({
			auth: true,
			id: req.session.id,
			username: req.session.username,
			_csrf: req.session._csrf
		});
	});
	server.del('/api/session/:id', function (req, res, next) {
		console.log("Logout by clearing the session");

		req.session.regenerate(function (err) {
			// Generate a new csrf token so the user can login again
			// This is pretty hacky, connect.csrf isn't built for rest
			// I will probably release a restful csrf module
			//			csrf.generate(req, res, function () {
			res.send({
				auth: false,
				_csrf: req.session._csrf
			});
			//			});
		});
	});

	/**
	 * When the user send a login request
	 */
	server.post('/api/login', function (req, resp) {
		var userName = req.body.userName,
			password = req.body.password;

		// Try to find an user with given username
		UserModel.findOne({userName: userName}, function (err, user) {
			if (err) console.err(err);

			if (!user) {
				return resp.send("No user found");
			}

			return user.comparePassword(password, function (err, isMatch) {
				if (isMatch) {
					// session, redirect, etc
					resp.send("Passwords are matching");
				}
				else {
					// redirect bad password
					resp.send("Passwords are not matching");
				}
				return resp.send(isMatch);
			});
		});
	});
	server.get('/api/user/:username', function (req, resp) {
		console.log(req.params.username);
		resp.send({
			name: req.params.username,
			isLogged: true
		});
	});
}
;