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
		userData.loadUserData(response.authResponse);
	});
});

app.controller('ChatController', function($scope, $interval, chat) {
	$scope.Events = Constants.MessageEvents;
	$scope.chatService = chat;	
	$scope.localMessageContent = '';
	$scope.ChatModes = Constants.ChatModes;
	$scope.chatMode = $scope.ChatModes.Chat;
	
	var userUpdatePromise = null;
	$scope.setChatMode = function(mode) {
		$scope.chatMode = mode;
		if (userUpdatePromise != null) {
			$interval.cancel(userUpdatePromise);
		}
		if (mode == $scope.ChatModes.ClientInfo) {
			chat.updateConnectedUserInfo();
			userUpdatePromise = $interval(chat.updateConnectedUserInfo, Constants.UserInfoRefreshInterval);
		}
	};
	$scope.setChatMode($scope.ChatModes.Chat);
	
	$scope.sendChatMessage = function($event) {
		if ($event == null || $event.charCode == 13) {
			if ($scope.localMessageContent.length > 0) {
				chat.sendChatMessage($scope.localMessageContent);
				$scope.localMessageContent = '';
			}
		}
	};
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