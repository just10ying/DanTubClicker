var UserDataService = angular.module('UserDataService', []);
UserDataService.service('UserData', function() {
	this._id = null;	
	
	this.ggs = 0;
	this.ggClickMultiplier = 1;
	this.ggClickBase = 1;
	
	this.gps = 0;
	
	this.updateGPS = function() {
		this.gps = 0;
	};
});