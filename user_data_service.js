angular.module('userDataService', []).service('userData', function($http, $interval) {
	// Loaded values:
	var authInfo = null;
	var userDataPackage = {
		ggs: 0
	};
	
	// Calculated values:
	var ggClickMultiplier = 1;
	var ggClickBase = 1;
	var gps = 0;
	
	var setUserDataPackage = function(dataPackage) {
		userDataPackage = dataPackage;
	};
	
	// Update GGs based on GPS
	$interval(function() {
		userDataPackage.ggs += (1 / Constants.GgUpdatesPerSecond) * gps;
	}, 1000 / Constants.GgUpdatesPerSecond);
	
	// Autosave
	$interval(function() {
		if (authInfo != null) {
			$http.put(Constants.UserDataURL, {authInfo: authInfo, data: userDataPackage}).
			success(function() {
				console.log(Constants.AutoSaveSuccess);
			}).
			error(function() {
				console.error(Constants.GgConnectError);
			});
		}
	}, Constants.AutoSaveInterval);
	
	this.getGgs = function() { return Math.floor(userDataPackage.ggs); };
	this.getGps = function() { return gps; };
	this.addClickGgs = function() { userDataPackage.ggs += ggClickBase * ggClickMultiplier; };
	this.loadUserData = function(userAuthInfo) {
		authInfo = userAuthInfo;
		$http.post(Constants.UserDataURL, {authInfo: authInfo}).
		success(function(data) {
			setUserDataPackage(data);
		}).
		error(function() {
			console.error(Constants.DataRetrievalError);
		});
	};
});