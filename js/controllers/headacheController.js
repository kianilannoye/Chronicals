/*!
 NAAM VAN ONS PROJECT, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller to add and modify headaches.
 */

angular.module('Chronic').controller('headacheController', function($scope, dataService){

    ons.ready(function() {
        $('.hidden').removeClass("hidden");
    });

  $scope.headache = dataService.getCurrentHeadache();

  if($scope.headache == null){
  	$scope.headache = { intensityValues: [], end: null, location: null, triggers: dataService.getTriggers(), symptoms: dataService.getSymptoms()};
  }

  $scope.setEnd = function(endDate, endTime){
  	if(endDate != null && endTime != null){
  		$scope.headache.end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endTime.getHours(), endTime.getMinutes());
  	}
  };

  if($scope.headache != null){
	  if($scope.end != null){
	  	$scope.end = new Date($scope.headache.end);
	  	$scope.endDate = $scope.end;
	  	$scope.endTime = $scope.end;
	  }
  } else $scope.end = null;

  $scope.setEndDate = function(endDate){
  	if(endDate != null){
  		if($scope.end == null) $scope.end = new Date();
	  	$scope.end.setFullYear(endDate.getFullYear());
	  	$scope.end.setMonth(endDate.getMonth());
	  	$scope.end.setDate(endDate.getDate());
  	}
  };

  $scope.setEndTime = function(endTime){
  	if(endTime != null){
  		if($scope.end == null) $scope.end = new Date();
	  	$scope.end.setHours(endTime.getHours());
	  	$scope.end.setMinutes(endTime.getMinutes());
	}
  };

  $scope.getIndexOfHeadache = function(){
  	headaches = dataService.getHeadacheList();
  	if(headaches == null || headaches.length == 0) return -1;
  	for(headache in headaches){
  		equalIntensityValues = true;
  		for(value in headache.intensityValues){
  			if(headache.intensityValues[value] != $scope.headache.intensityValues[value]) equalIntensityValues = false;
  		}
  		equalEnd = $scope.headache.end == headaches[headache].end;
  		equalLocation = $scope.headache.location == headaches[headache].location;
  		if(equalIntensityValues && equalEnd && equalLocation) return headache;
  		return -1;
  	}
  };

  $scope.headacheIndex = $scope.getIndexOfHeadache();

  /* Create a nice short time string from the start date and time */

  $scope.updateStartTimeString = function(){
  	if($scope.headache.intensityValues[0] == null) {
  		$scope.startTimeString = "";
  		return;
  	}
  	var months = ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sept.", "okt.", "nov.", "dec."];
  	var month = months[(new Date($scope.headache.intensityValues[0].key).getMonth())];
  	var day = (new Date($scope.headache.intensityValues[0].key).getDate().toString());
  	var hour =(new Date($scope.headache.intensityValues[0].key).getHours().toString());
  	if(hour < 10) hour = "0"+hour;
  	var minute = new Date($scope.headache.intensityValues[0].key).getMinutes().toString();
  	if(minute < 10) minute = "0"+minute;
  	$scope.startTimeString = day + " " + month + " " + hour + ":" + minute;
  };

  $scope.$watch('headache.intensityValues[0]', $scope.updateStartTimeString);

  /* closeAndSave is called when the user pressed the "Sla op" button */

  $scope.closeAndSave = function(){
  	console.log($scope.headacheIndex);

  	if($scope.headacheIndex != -1){
  	list = dataService.getHeadacheList();
  	list[$scope.headacheIndex] = $scope.headache;
  	dataService.setHeadacheList(list);
  	} else dataService.addHeadache($scope.headache);

  	dataService.setCurrentHeadache(null);
  	location.href="dashboard.html";
  };

  $scope.cancel = function(){
  	dataService.setCurrentHeadache(null);
  	location.href="dashboard.html";
  };

  /* Some ugly hack with jQuery to link a popover the the corresponding help buttons */
  $scope.message = "";

  var searchIndexById = function(list, id){
  	// Search the index of an id in a list of objects with ids
  	for(object in list){
  		if(list[object].id == id) return object;
  	}
  	return -1;
  };

  for(trigger in $scope.headache.triggers){ // Close your eyes and pretend this is not here ;)
  	// Initialize function on each helpButton for each trigger
  	$(document).on("click", '#helpButtonTrigger'+$scope.headache.triggers[trigger].id, function(){
  		var id = ($(this)[0].id).split('helpButtonTrigger');
  		var index = searchIndexById($scope.headache.triggers, id[1]);
  		$scope.message = $scope.headache.triggers[index].description;
  		$scope.popover.show("#"+$(this)[0].id);
  	});
  };

  for(symptom in $scope.headache.symptoms){ // Close your eyes and pretend this is not here ;)
  	// Initialize function on each helpButton for each trigger
  	$(document).on("click", '#helpButtonSymptom'+$scope.headache.symptoms[symptom].id, function(){
  		var id = ($(this)[0].id).split('helpButtonSymptom');
  		var index = searchIndexById($scope.headache.symptoms, id[1]);
  		$scope.message = $scope.headache.symptoms[index].description;
  		$scope.popover.show("#"+$(this)[0].id);
  	});
  };

  $(document).on("click", '.popover', function(){
  	$scope.popover.hide();
  });

  ons.createPopover('popover.html').then(function(popover) {
  	// Create a popover for the help buttons
    $scope.popover = popover;
  });

  /* All variables and functions used to add intensity values and delete them */

  $scope.newHeadacheValue;
  $scope.newHeadacheDate;
  $scope.newHeadacheTime;

  $scope.deleteEntry = function(item){
  	$scope.headache.intensityValues.splice($scope.headache.intensityValues.indexOf(item), 1);
  	if($scope.headache.intensityValues.length == 0) $("#endDateForm").hide();
  };

    $scope.setNewHeadacheValue = function(newValue){
        $scope.newHeadacheValue = newValue;
    };

  $scope.addIntensityValue = function(){
  	/* This function is called when we want to add an Intensity Value (it doesn't add it to the list yet...) */
  	$scope.newHeadacheValue = 5;
  	$scope.newHeadacheDate = new Date();
  	$scope.newHeadacheTime = $scope.newHeadacheDate;
  };

  $scope.saveIntensityValue = function(navigator, page){
  	var start = new Date($scope.newHeadacheDate.getFullYear(), $scope.newHeadacheDate.getMonth(), $scope.newHeadacheDate.getDate(), $scope.newHeadacheTime.getHours(), $scope.newHeadacheTime.getMinutes());
	$scope.headache.intensityValues.push({key: start, value: $scope.newHeadacheValue});
	$scope.headache.intensityValues.sort(function(a, b){
		if(a.key < b.key) return -1;
		if(a.key > b.key) return 1;
		else return 0;
	});
  	if($scope.headache.intensityValues.length == 1) $("#endDateForm").show();
  	console.log("Saving the value"+$scope.newHeadacheValue+$scope.newHeadacheDate+$scope.newHeadacheTime+"!!");
  	navigator.popPage(page); // We're in the add intensity form. Popping a page will return to the list intensity form
  };

    $scope.setValues = function (v, d, t) {
        $scope.newHeadacheValue = v;
        $scope.newHeadacheDate = d;
        $scope.newHeadacheTime = t;
    };


});

angular.module('Chronic').directive('ngModel', function( $filter ) {
	// This is used to remove seconds and milliseconds in time pickers
    return {
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
            if( !ngModel )
                return;
            if( attr.type !== 'time' )
                return;

            ngModel.$formatters.unshift(function(value) {
                return value.replace(/(:\d\d)(:.*)$/, '\$1');
            });
        }
    };
});

angular.module('Chronic').directive('validenddate', function() {
  return {
    require: 'ngModel',
    link: function($scope, ele, attrs, c) {
    	c.$validators.validEndDate = function(modelValue, viewValue){
	    	$scope.setEndDate(modelValue);
	    	console.log($scope.end);
	    	console.log($scope.headache.intensityValues[$scope.headache.intensityValues.length-1].key);
	    	if(c.$isEmpty(modelValue)) {
		        // consider empty models to be valid
		        return true;
	    	}
	    	if($scope.headache.intensityValues.length != 0 && $scope.end >= $scope.headache.intensityValues[$scope.headache.intensityValues.length-1].key){
	    		return true;
	    	}
	    	return false;
		};
    }
  };
});

angular.module('Chronic').directive('validendtime', function() {
  return {
    require: 'ngModel',
    link: function($scope, ele, attrs, c) {
    	c.$validators.validEndTime = function(modelValue, viewValue){
        	$scope.setEndTime(modelValue);
	    	if(c.$isEmpty(modelValue)) {
		        // consider empty models to be valid
		        return true;
        	}
        	if($scope.headache.intensityValues.length != 0 && $scope.end >= new Date($scope.headache.intensityValues[$scope.headache.intensityValues.length-1].key)){
        		return true;
        	}
        	return false;
    	};
    }
  };
});
