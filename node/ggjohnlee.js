// Constants
var CONSTANTS = {
	HttpPort: 8081,
	WebSocketsPort: 8082,
	MongoDbURL: 'mongodb://localhost:27017/dantub',
	UserDataURL: '/server/user_data',
	UserDataCollection: 'user_data',
	ID: '_id'
};

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

app.post(CONSTANTS.UserDataURL, function(req, res) {
	assert.notEqual(dbGlobal, null);
	
	dbGlobal.collection(CONSTANTS.UserDataCollection).findOne({'_id' : '' + req.body._id}, function(err, result) {
		if (result) {
			res.send(JSON.stringify(result));
		}
	});	
	
});

app.put(CONSTANTS.UserDataURL, function(req, res) {
	assert.notEqual(dbGlobal, null);
		
	var cursor = dbGlobal.collection(CONSTANTS.UserDataCollection).find({'_id' : req.body._id});
	cursor.count(false, function(err, count) {
		if (count == 0) {
			dbGlobal.collection(CONSTANTS.UserDataCollection).insertOne(req.body,
				function(err, results) {
					assert.equal(err, null);
			});
		}
		else {
			dbGlobal.collection(CONSTANTS.UserDataCollection).replaceOne({'_id' : req.body._id},
				req.body,
				function(err, results) {
					assert.equal(err, null);
				});
		}
	});
	
	res.send();
});

app.listen(CONSTANTS.HttpPort);

// ------------------------ Init DBConnection ------------------------ //

var dbGlobal = null;

MongoClient.connect(CONSTANTS.MongoDbURL, function(err, db) {
	assert.equal(null, err);
	console.log("[INFO] Connected to database");
	dbGlobal = db;
});

process.on("SIGINT", function() {
	console.log("[INFO] Shutting down DanTub Clicker server");
	dbGlobal.close();
	process.exit();
});

// ------------------------ WebSockets ------------------------ //
server.listen(CONSTANTS.WebSocketsPort);

var EVENTS = {
	Connect : 'gg',
	Message : 'jahnlee'
};

io.on('connection', function(socket) {
	socket.on(EVENTS.Connect, function(data) {
		io.sockets.emit(EVENTS.Message, {
			type: 'connect',
			content: data + ' is online.'
		});
	});
	socket.on(EVENTS.Message, function(data) {
		io.sockets.emit(EVENTS.Message, {
			type: 'chat',
			alias: data.alias,
			content: data.content
		});
	});
});
