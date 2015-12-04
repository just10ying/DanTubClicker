var app = angular.module('dantubApp', ['userDataService', 'facebookUtils', 'luegg.directives']);
app.constant('facebookConfigSettings', {
	'appID' : Constants.FacebookAppId,
	'loginSuccess': 'fbLoginSuccess',
	'logoutSuccess': 'fbLogoutSuccess'
});

app.controller('ClickerController', function($scope, userData) {
	$scope.addClickGgs = userData.addClickGgs;
	$scope.numGgs = userData.getGgs;
	$scope.gps = userData.getGps;
});

app.controller('FacebookController', function($rootScope, userData, facebookConfigSettings) {
	$rootScope.$on(facebookConfigSettings.loginSuccess, function(name, response) {
		userData.loadUserData(response.authResponse.userID);
	});
});

app.controller('ChatController', function($scope, $rootScope, $http, $interval, facebookConfigSettings) {
	$scope.Events = Constants.MessageEvents;
	$scope.messages = [];
	$scope.localMessageContent = '';
	$scope.alias = Constants.DefaultAlias;
	$scope.connected = false;
	$scope.connectedUsers = [];
	$scope.numConnectedUsers = 0;
	$scope.ChatModes = Constants.ChatModes;
	$scope.chatMode = $scope.ChatModes.Chat;
	
	var updateConnectedUserInfo = function() {
		$http.get(Constants.ConnectedClientsURL).
		success(function(data, status, headers, config) {
			$scope.connectedUsers = [];
			$scope.numConnectedUsers = 0;
			for (var key in data) {
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
		if (mode == $scope.ChatModes.ClientInfo) {
			updateConnectedUserInfo();
			userUpdatePromise = $interval(updateConnectedUserInfo, Constants.UserInfoRefreshInterval);
		}
		else {
			if (userUpdatePromise != null) {
				$interval.cancel(userUpdatePromise);
			}
		}
	};
	$scope.setChatMode($scope.ChatModes.Chat);
	
	$scope.sendChatMessage = function($event) {
		if ($event == null || $event.charCode == 13) {
			socket.emit($scope.Events.ChatMessage, {
				alias: $scope.alias,
				content: $scope.localMessageContent
			});
			$scope.localMessageContent = '';
		}
	};
	
	var socket = io.connect(':' + Constants.WebsocketPort);	
	socket.on($scope.Events.SocketIOConnect, function() {
		$scope.connected = true;
	});
	socket.on($scope.Events.ChatMessage, function(data) {
		$scope.messages.push(data);
	});
	
	$rootScope.$on(facebookConfigSettings.loginSuccess, function(name, response) {
		FB.api('/me', function(response) {
			$scope.alias = response.name;
			socket.emit($scope.Events.FbConnect, response.name);
		});
	});
	
	$rootScope.$on(facebookConfigSettings.logoutSuccess, function() {
		$scope.alias = Constants.DefaultAlias;
	});
});

app.controller('QuoteController', function($scope, $interval) {
	var refreshQuote = function() {
		var index = Math.floor(Math.random() * Constants.JohnLeeQuotes.length);
		$scope.quote = Constants.JohnLeeQuotes[index];
	};
	
	refreshQuote();
	$interval(refreshQuote, Constants.QuoteRefreshInterval);
});

app.controller('CenterTabController', function($scope) {
	$scope.tabs = Constants.HomeTabNames;
	$scope.changeTab = function(tab) {
		$scope.currentTab = tab;
	}
	$scope.changeTab($scope.tabs.Home);
});