/**
 * Created by Elior on 03/08/13.
 */
var fs = require('fs')
	, path = require('path')
	, url = require('url')
	, http = require('http')
	, mongo = require('mongoose')
	, express = require('express')

var localhost = "127.0.0.1"
var httpPort = process.env.port || 27001;

var config = require('./src/config');

// Create a new server
var server = express();

/**
 * Middleware to decline OPTIONS requests issued by CORS requests
 * @param req
 * @param res
 * @param next
 */
var declineOptions = function (req, res, next) {
	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
	}
	else {
		next();
	}
}

/**
 * Middleware to allow CORS requests for specific domains
 * @param req the request
 * @param res the response
 * @param next the next middleware
 */
var allowCrossDomain = function (req, res, next) {
	var allowedHost = ['http://klarthdev.org:3000', 'http://localhost:63342','http://localhost:8080'];
	if (allowedHost.indexOf(req.headers.origin) !== -1) {
		//		console.log("Allowed access to "+ req.headers.origin);
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
server.configure(function () {
	// Favicon
	server.use(express.favicon());
	// Parse json/multipart body
	server.use(express.bodyParser());
	// Allow method override (PUT/DELETE)
	server.use(express.methodOverride());
	// Allow cookies
	server.use(express.cookieParser());
	// Allow session state with secret
	server.use(express.session({ secret: '14f085be4a63d0f266b51b8fa92ee3b612dc16de'}));
	// Only allow specific domains (CORS)
	server.use(allowCrossDomain);
	// Protect against Cross Site Request Forgery
	//server.use(express.csrf());
	server.use(declineOptions);
	// Use router for html pages
	server.use(server.router);
	// Serve pages under the 'web' directory
	server.use(express.static(path.join(__dirname, 'web')));
});

server.configure('development', function(){
	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
server.configure('production', function(){
	server.use(express.errorHandler());
});

function start() {
	// Connect to db
	mongo.connect(config.mongoUrl);

	// Create the routes
	var router = require('./src/router');
	router.initRoutes(server);
	server.listen(httpPort);
	console.log("Server running at " + localhost + ":" + httpPort);
}

exports.start = start;
exports.server = server;