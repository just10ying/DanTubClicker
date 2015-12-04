angular.module('dantubApp').service('chat', function($http, $rootScope, facebookConfigSettings) {
	var self = this;
	var connected = false;
	var alias = Constants.DefaultAlias;
	var messages = [];
	var connectedUsers = [];
	var numConnectedUsers = 0;
		
	var socket = io.connect(':' + Constants.WebsocketPort);	
	socket.on(Constants.MessageEvents.SocketIOConnect, function() {
		connected = true;
	});
	socket.on(Constants.MessageEvents.ChatMessage, function(data) {
		messages.push(data);
	});
	
	$rootScope.$on(facebookConfigSettings.loginSuccess, function(name, response) {
		FB.api('/me', function(response) {
			alias = response.name;
			socket.emit(Constants.MessageEvents.FbConnect, alias);
		});
	});
	$rootScope.$on(facebookConfigSettings.logoutSuccess, function() {
		alias = Constants.DefaultAlias;
	});
	
	this.sendChatMessage = function(message) {
		socket.emit(Constants.MessageEvents.ChatMessage, {
			alias: alias,
			content: message
		});
	};
	
	this.updateConnectedUserInfo = function() {
		$http.get(Constants.ConnectedClientsURL).
		success(function(data) {
			connectedUsers = [];
			numConnectedUsers = 0;
			for (var key in data) {
				numConnectedUsers++;
				if (data[key].alias != null) {
					connectedUsers.push(data[key].alias);
				}
			}
		});
	};
	
	this.isConnected = function() { return connected; };
	this.getMessages = function() { return messages; };
	this.getConnectedUsers = function() { return connectedUsers; };
	this.getNumConnectedUsers = function() { return numConnectedUsers; };
});