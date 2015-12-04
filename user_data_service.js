angular.module('userDataService', []).service('userData', function($http, $interval) {
	// Loaded values:
	var _id = null;
	var ggs = 0;
	
	// Calculated values:
	var ggClickMultiplier = 1;
	var ggClickBase = 1;
	var gps = 0;
	
	// Update GGs based on GPS
	$interval(function() {
		ggs += (1 / Constants.GgUpdatesPerSecond) * gps;
	}, 1000 / Constants.GgUpdatesPerSecond);
	
	// Autosave
	$interval(function() {
		if (_id != null) {
			$http.put(Constants.UserDataURL, {'_id': _id, 'ggs': ggs}).
			success(function() {
				console.log(Constants.AutoSaveSuccess);
			}).
			error(function() {
				console.error(Constants.GgConnectError);
			});
		}
	}, Constants.AutoSaveInterval);
	
	this.getGgs = function() {
		return Math.floor(ggs);
	};
	
	this.getGps = function() {
		return gps;
	};
	
	this.addClickGgs = function() {
		ggs += ggClickBase * ggClickMultiplier;
	};
	
	this.loadUserData = function(userID) {
		_id = userID;
		$http.post(Constants.UserDataURL, {_id: userID}).
		success(function(data) {
			ggs = data.ggs;
		}).
		error(function() {
			console.error(Constants.DataRetrievalError);
		});
	};
});