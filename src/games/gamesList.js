var http = require('http');
var request = require('request');
var url = require('url');

// one way to write a module without the "exports.*" stuff
var gamesList = (function () {
	function returnAllGames(req, resp) {
		var games = [
			{
				title: 'Zelda',
				description: 'The LEgend of Zelda'
			},
			{
				title: 'Mario',
				description: ' The Legend of Mario'
			}
		];
		resp.writeHead(200, {"Content-Type": "text/json"});
		resp.end(JSON.stringify(games));
	};

	function returnGames(req, response) {
		var userName = req.params.userName || "";
		if (!userName || !userExists(userName)) {
			response.writeHead(403); // Unauthorized
			response.end();
		}

		console.log("Returning the games of user " + userName);
		var games = [
			{
				title: 'Zelda',
				description: 'The LEgend of Zelda'
			}
		];

		response.write(JSON.stringify(games))
		response.end();

	}

	// todo use mongodb
	function userExists(user){
		if (user == "Luigi") return true;
		return false;
	}

	return {
		returnGames: returnGames,
		returnAllGames: returnAllGames
	};
})();

module.exports = gamesList;