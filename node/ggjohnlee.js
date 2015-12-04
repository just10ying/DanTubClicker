// Load constants
var Constants = require('./const.js');
console.log(Constants.ServerConstantLoadComplete);

// Mongodb dependencies
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

// Express dependencies
var bodyParser = require('body-parser');
var app = require('express')();

// Websockets dependencies
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Initialize express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Declare handlers:
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'http://ggjohnlee.com');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.post(Constants.UserDataURL, function(req, res) {
	assert.notEqual(dbGlobal, null);
	
	dbGlobal.collection(Constants.MongoUserDataCollection).findOne({'_id' : '' + req.body._id}, function(err, result) {
		if (result) {
			res.send(JSON.stringify(result));
		}
	});	
	
});

app.put(Constants.UserDataURL, function(req, res) {
	assert.notEqual(dbGlobal, null);
		
	var cursor = dbGlobal.collection(Constants.MongoUserDataCollection).find({'_id' : req.body._id});
	cursor.count(false, function(err, count) {
		if (count == 0) {
			dbGlobal.collection(Constants.MongoUserDataCollection).insertOne(req.body,
				function(err, results) {
					assert.equal(err, null);
			});
		}
		else {
			dbGlobal.collection(Constants.MongoUserDataCollection).replaceOne({'_id' : req.body._id},
				req.body,
				function(err, results) {
					assert.equal(err, null);
				});
		}
	});
	
	res.send();
});

// ------------------------ Init DBConnection ------------------------ //

var dbGlobal = null;

MongoClient.connect(Constants.MongoDbURL, function(err, db) {
	assert.equal(null, err);
	dbGlobal = db;
});

process.on("SIGINT", function() {
	dbGlobal.close();
	console.log("[INFO] Shutting down DanTub Clicker server");
	process.exit();
});

// ------------------------ WebSockets ------------------------ //
server.listen(Constants.WebsocketPort);

var EVENTS = {
	SocketIOConnect : 'connect',
	SocketIODisconnect : 'disconnect',
	Connect : 'fb_connect',
	Message : 'chat_message'
};

var clients = {}; // Hashtable of clients

io.on('connection', function(socket) {
	clients[socket.id] = {alias: null}; // By default, alias is null.

	socket.on(EVENTS.SocketIODisconnect, function(data) {
		delete clients[socket.id];
	});
	
	socket.on(EVENTS.Connect, function(data) {
		clients[socket.id].alias = data; // Set socket name
		
		io.sockets.emit(EVENTS.Message, {
			type: EVENTS.Connect,
			content: data + ' signed in.'
		});
	});
	socket.on(EVENTS.Message, function(data) {
		io.sockets.emit(EVENTS.Message, {
			type: EVENTS.Message,
			alias: data.alias,
			content: data.content
		});
	});
});

app.get(Constants.ConnectedClientsURL, function(req, res) {
	res.send(clients);	
});

// ------------------------ Start webserver ------------------------ //

app.listen(Constants.ServerHttpPort);
console.log("[INFO] Server online");