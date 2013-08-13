/**
 * Created by Elior on 03/08/13.
 */
var fs = require('fs')
	, path = require('path')
	, url = require('url')
	, http = require('http')
	, mongo = require('mongoose')
	, express = require('express')
	, requirejs = require('requirejs');

var localhost = "127.0.0.1"
var httpPort = process.env.port || 8080;

var config = require('./src/config');

// Create a new server
var server = express();

var allowCrossDomain = function (req, res, next) {
	// Added other domains you want the server to give access to
	// WARNING - Be careful with what origins you give access to
	var allowedHost = ['http://localhost:63342'];
	if (allowedHost.indexOf(req.headers.origin) !== -1) {
		console.log("Allowed access to "+ req.headers.origin);
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Origin', req.headers.origin)
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
		next();
	}
	else {
		console.log("Unauthorized access");
		res.send({auth: false});
	}
}
// Configure server
// Favicon
server.use(express.favicon());
// Parse json/multipart body
server.use(express.bodyParser());
// Allow method override (PUT/DELETE)
server.use(express.methodOverride());
// Allow cookies
server.use(express.cookieParser());
// Allow session state with secret
server.use(express.session({ secret: 'mallowigiGameColl'}));
// Protect against Cross Site Request Forgery
//server.use(express.csrf());
// Only allow specific domains (CORS)
server.use(allowCrossDomain);
// Use router for html pages
server.use(server.router);
// Serve pages under the 'web' directory
server.use(express.static(path.join(__dirname, 'web')));
// Pass errors and dump them
server.use(express.errorHandler({ dumpExceptions: true, showStack: true}));

// Connect to db
mongo.connect(config.mongoUrl);

// Create the routes
var router = require('./src/router');
router.initRoutes(server);

server.listen(httpPort);
console.log("Server running at " + localhost + ":" + httpPort);

