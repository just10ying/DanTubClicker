var app = angular.module('dantubApp', ['UserDataService', 'facebookUtils', 'luegg.directives']);
app.constant('facebookConfigSettings', {
	'appID' : '1598147250427698'
});

app.controller('ClickerController', function($scope, $rootScope, $interval, UserData) {
	var UPDATES_PER_SECOND = 5;
	
	$scope.data = UserData;
	$scope.awardClickGgs = function() {
		$scope.data.ggs += $scope.data.ggClickBase * $scope.data.ggClickMultiplier;
	}
		
	$interval(function() {
		$scope.data.ggs += (1 / UPDATES_PER_SECOND) * $scope.data.gps;
	}, 1000 / UPDATES_PER_SECOND);
});

app.controller('FacebookController', function($scope, $rootScope, $interval, $http, UserData) {
	var USER_DATA_URL = "/server/user_data";
	var GG_CONNECT_ERROR = "[Error] could not authenticate with GgJohnLee.com servers.";
	var DATA_RETRIEVAL_ERROR = "[Error] could not retrieve user data at this time.";
	var SAVE_SUCCESS = "[Info] Save successful";
	var AUTOSAVE_TIMEOUT = 10000;
	
	var retrieveUserData = function(userID) {
		$http.post(USER_DATA_URL, JSON.stringify({_id: userID})).
		success(function(data, status, headers, config) {
			UserData.ggs = data.ggs;
		}).
		error(function(data, status, headers, config) {
			console.error(DATA_RETRIEVAL_ERROR);
		});
	};
	
	$interval(function() {
		if (UserData._id != null) {
			$http.put(USER_DATA_URL, JSON.stringify(UserData)).
			success(function(data, status, headers, config) {
				
			}).
			error(function(data, status, headers, config) {
				console.error(GG_CONNECT_ERROR);
			});
		}
	}, AUTOSAVE_TIMEOUT);
	
	$rootScope.$on('fbLoginSuccess', function(name, response) {
		UserData._id = response.authResponse.userID;
		retrieveUserData(UserData._id);
	});
});

app.controller('ChatController', function($scope, $rootScope, $http, $interval) {
	var SOCKET_ADDR = 'http://ggjohnlee.com:8082';
	var CONNECTED_CLIENTS_URL = '/server/connected_clients'; 
	var DEFAULT_ALIAS = 'Guest';
	var UPDATE_USER_INFO_MS = 5000;
	$scope.EVENTS = {
		SocketIOConnect : 'connect',
		SocketIODisconnect : 'disconnect',
		Connect : 'fb_connect',
		Message : 'chat_message'
	};
	
	$scope.messages = [];
	$scope.localMessageContent = '';
	$scope.alias = DEFAULT_ALIAS;
	$scope.connected = false;
	$scope.connectedUsers = [];
	$scope.numConnectedUsers = 0;
	
	$scope.CHATMODES = {
		Chat : 'chat',
		ClientInfo : 'client_info'
	};
	$scope.chatMode = $scope.CHATMODES.Chat;
	var updateConnectedUserInfo = function() {
		$http.get(CONNECTED_CLIENTS_URL).
		success(function(data, status, headers, config) {
			$scope.connectedUsers = [];
			$scope.numConnectedUsers = 0;
			for (key in data) {
				$scope.numConnectedUsers++;
				if (data[key].alias != null) {
					$scope.connectedUsers.push(data[key].alias);
				}
			}
		});
	};
	var userUpdatePromise = null;
	$scope.setChatMode = function(mode) {
		$scope.chatMode = mode;
		if (mode == $scope.CHATMODES.ClientInfo) {
			updateConnectedUserInfo();
			userUpdatePromise = $interval(updateConnectedUserInfo, UPDATE_USER_INFO_MS);
		}
		else {
			if (userUpdatePromise != null) {
				$interval.cancel(userUpdatePromise);
			}
		}
	};
	
	
	$scope.sendChatMessage = function($event) {
		if ($event == null || $event.charCode == 13) {
			socket.emit($scope.EVENTS.Message, {
				alias: $scope.alias,
				content: $scope.localMessageContent
			});
			$scope.localMessageContent = '';
		}
	};
	
	var socket = io.connect(SOCKET_ADDR);	
	socket.on($scope.EVENTS.SocketIOConnect, function() {
		$scope.connected = true;
	});
	socket.on($scope.EVENTS.Message, function(data) {
		$scope.messages.push(data);
	});
	
	$rootScope.$on('fbLoginSuccess', function(name, response) {
		FB.api('/me', function(response) {
			$scope.alias = response.name;
			socket.emit($scope.EVENTS.Connect, response.name);
		});
	});
});

app.controller('QuoteController', function($scope, $interval) {
	var QUOTE_REFRESH_TIMER = 10000;
	var QUOTES = [
		'"aaaaaaaaaaaahhhhhhhhhhHHHHHHHHHH" ~ John Lee',
		'"It is I, Mayro" ~ Supra Mayro',
		'"Guys where is my base" ~ John Lee',
		'"Hwyyyyyyyyyyyyyyyyyyyyy" ~ John Lee',
		'"This is the kind of fanservice I\'m opposed to" ~ John Lee',
		'"I don\'t want no birds.  Please don\'t give me any birds" ~ John Lee',
		'"Who could it be?  Believe it or not... it\'s JAHN LEE" ~ Joey',
		'"YASSSSSSSSSSS BC SURPRISE" ~ Joey'
	];
	
	$scope.quote = '';
	
	var refreshQuote = function() {
		var index = Math.floor(Math.random() * QUOTES.length);
		$scope.quote = QUOTES[index];
	};
	
	$interval(refreshQuote, QUOTE_REFRESH_TIMER);
	refreshQuote();
});

app.controller('CenterTabController', function($scope) {
	$scope.tabs = {
		home: 'home',
		options: 'options',
		comments: 'comments'
	};
	$scope.currentTab = $scope.tabs.home;
	$scope.changeTab = function(tab) {
		$scope.currentTab = tab;
	}
});