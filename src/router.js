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
			console.log("No username sent");
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
		var userName = req.body.username,
			password = req.body.password;

		var errors = {}, fail = false;
		if (userName === '') {
			fail = true;
			errors['username'] = "No username supplied";
		}
		if (password === '') {
			fail = true;
			errors['password'] = "No password supplied";
		}

		if (fail) {
			return resp.send(errors);
		}

		UserModel.findOne({userName: userName}, function (err, user) {
			console.log("Entering findone");

			if (err) {
				errors['database'] = err;
				resp.writeHead(500);
				return resp.send(errors);
			}

			if (!user) {
				console.error("No user found");
				errors['username'] = "No user found";
				return resp.send(errors);
			}
			else {
				console.log("Comparing");
				user.comparePassword(password, function (err, isMatch) {
					if (isMatch) {
						console.log("MAtch found");
						return resp.send(errors);
					}
					else {
						errors['password'] = "Wrong password";
						console.log("Not found match");
						return resp.send(errors);
					}
				});
			}
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