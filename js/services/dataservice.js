angular.module('Chronic').config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";

    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    $httpProvider.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
}]).service('dataService', function ($http) {

    // Reset the local storage; always comment this out!
    //  $localStorage.$reset();
    //  localStorage.clear();
    var currentHeadache;

    var currentMedicine;

    var medicineList = [];
    var headacheList = [];

    var dailyMedicine = [];

    var passwordHash = "";
    var email = "";

    var patientID = -1;
    var triggers = [];
    var symptoms = [];
    var drugs = [];

    var getAuthorization = function () {
        var currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser != null) return 'Basic ' + btoa(currentUser.email + ":" + sha3_512(currentUser.passwordHash + getApiKey()));
        else return null;
    };


    var addHeadache = function (newObj) {
        if (JSON.parse(localStorage.getItem("headacheList")) != null) {
            headacheList = JSON.parse(localStorage.getItem("headacheList"));
            headacheList.push(newObj);
            localStorage.setItem("headacheList", JSON.stringify(headacheList));

        }
        else {
            localStorage.setItem("headacheList", JSON.stringify([newObj]));
            headacheList = [newObj];
        }
    };

    var sendHeadacheToDB = function(headacheObj){
        return new Promise(function(resolve,reject) {
            var dataPost = {
                "intensityValues" : headacheObj.intensityValues,
                "end": headacheObj.end,
                "locations": headacheObj.location,
                "symptomIDs": [],
                "triggerIDs": []
            };

            var newLocations = {};
            for(var headacheLocation in headacheObj.location){
                //console.log("locations:"+headacheLocation+headacheObj.location[headacheLocation]);
                newLocations[headacheLocation] = headacheObj.location[headacheLocation];
            }
            dataPost.locations = newLocations;
            var newTriggers = [];
            for (var trigger in headacheObj.triggers){
                console.log("Trigger:"+headacheObj.triggers[trigger]);
                console.log("Trigger id:"+headacheObj.triggers[trigger].id);
                if(headacheObj.triggers[trigger].val){
                    newTriggers.push(headacheObj.triggers[trigger].id);
                }

            }
            console.log("Triggers", newTriggers);
            dataPost.triggerIDs = newTriggers;
            console.log("Datapost:"+dataPost);
            var newSymptoms = [];
            for (var symptom in headacheObj.symptoms){
                console.log("Symptom:"+headacheObj.symptoms[symptom]);
                console.log("Symptom id:"+headacheObj.symptoms[symptom].id);
                if(headacheObj.symptoms[symptom].val){
                    newSymptoms.push(headacheObj.symptoms[symptom].id);
                }

            }
            console.log("Symptoms", newSymptoms);
            dataPost.symptomIDs = newSymptoms;
            //var newHeadacheTriggers = JSON.parse(localStorage.getItem("triggers"));
            //for(var trigger in newHeadacheTriggers){
            //    var triggerIndex = entry.triggerIDs.indexOf(newHeadacheTriggers[trigger].id);
            //    if(triggerIndex > -1){
            //        newHeadacheTriggers[triggerIndex].val = true;
            //    }
            //}
            //var newHeadacheSymptoms = JSON.parse(localStorage.getItem("symptoms"));
            //for(var symptom in newHeadacheSymptoms){
            //    var symptomIndex = entry.triggerIDs.indexOf(newHeadacheSymptoms[symptom].id);
            //    if(symptomIndex > -1){
            //        newHeadacheSymptoms[symptomIndex].val = true;
            //    }
            //}


            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic/rest/HeadacheService/headaches?patientID=2",
                data: JSON.stringify(dataPost),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                resolve();
            }).
            error(function (data, status, headers, config) {
                reject();
            });
        });

        //    .then(function successCallback(response) {
        //    // this callback will be called asynchronously
        //    // when the response is available
        //    console.log("Return van indienen hoofdpijn:"+status);
        //}, function errorCallback(response) {
        //    // called asynchronously if an error occurs
        //    // or server returns response with an error status.
        //    console.log("error creating user: "+response);
        //    //console.log("data:" +data);
        //    console.log(response);
        //    console.log(response.config);
        //});

            //$http.post("http://tw06v033.ugent.be/Chronic/rest/HeadacheService/headaches?patientID="+patientID, JSON.stringify(headacheObj)).
            //    success(function (data, status, headers, config) {
            //        console.log("Return van indienen user:"+status);
            //    }).
            //    error(function (data, status, headers, config) {
            //        console.log("error creating user: "+status);
            //        console.log("data:" +data);
            //    });
    };



    var addMedicine = function (newObj) {
        if (JSON.parse(localStorage.getItem("medicineList")) != null) {
            medicineList = JSON.parse(localStorage.getItem("medicineList"));
            medicineList.push(newObj);
            localStorage.setItem("medicineList", JSON.stringify(medicineList));
        }
        else {
            localStorage.setItem("medicineList", JSON.stringify([newObj]));
        }
    };

    var setCurrentHeadache = function (newObj) {
        localStorage.setItem("currentHeadache", JSON.stringify(newObj));
        currentHeadache = newObj;
    };

    var setCurrentMedicine = function (newObj) {
        localStorage.setItem("currentMedicine", JSON.stringify(newObj));
        currentMedicine = newObj;
    };

    var getCurrentHeadache = function () {
        return JSON.parse(localStorage.getItem("currentHeadache"));
    };

    var getCurrentMedicine = function () {
        return JSON.parse(localStorage.getItem("currentMedicine"));
    };

    var getMedicineList = function () {
        return JSON.parse(localStorage.getItem("medicineList"));
    };

    var getHeadacheList = function () {
        var list = JSON.parse(localStorage.getItem("headacheList"));
        if (list != null && list != "null") {
            list.sort(function (a, b) { //sort the list on their start dates // date of consumption

                dateA = a.intensityValues[0].key;
                dateB = b.intensityValues[0].key;
                return (new Date(dateA.toString())) - (new Date(dateB.toString()));
            });
        }
        return list;
    };

    var getDrugsFromDB = function(){
        return new Promise(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic/rest/DrugService/drugs', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    //alert("CONNECTED TO INTERNET OR DATABASE " + status);
                    var list = data;
                    var remoteDrugs = [];
                    list.forEach(function(entry){
                        remoteDrugs.push({id: entry.drugID, name: entry.name, description: entry.description});
                    });
                    // drugList consists of a list specified by the doctor which is gotten remotely,
                    // and a list of own-made drugs
                    if (JSON.parse(localStorage.getItem("ownDrugList")) != null) {
                        remoteDrugs = remoteDrugs.concat(JSON.parse(localStorage.getItem("ownDrugList")));
                    }
                    //remoteDrugs[remoteDrugs.length] = {id: -1, name: "...", description: "Own custom drug"};
                    localStorage.setItem("drugList", JSON.stringify(remoteDrugs));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    // If the connection failed, we just use the old drugList (this can't be the first time the app is started)
                    var drugList = JSON.parse(localStorage.getItem("drugList"));
                    if (drugList == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getSymptomsFromDB = function(){
        return new Promise(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic/rest/SymptomService/symptoms', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var symptoms = data;
                    var newSymptoms = [];
                    symptoms.forEach(function (entry) {
                        newSymptoms.push({id: entry.symptomID, name: entry.name, description: entry.description,
                                          val: false});
                    });
                    localStorage.setItem("symptoms", JSON.stringify(newSymptoms));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var symptoms = JSON.parse(localStorage.getItem("symptoms"));
                    if (symptoms == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getTriggersFromDB = function(){
        return new Promise(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic/rest/TriggerService/triggers', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var triggers = data;
                    var newTriggers = [];
                    triggers.forEach(function (entry) {
                        newTriggers.push({id: entry.triggerID, name: entry.name, description: entry.description,
                                          val: false});
                    });
                    localStorage.setItem("triggers", JSON.stringify(newTriggers));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var triggers = JSON.parse(localStorage.getItem("symptoms"));
                    if (triggers == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getHeadachesFromDB = function(){
        return new Promise(
            function (resolve, reject) {
                var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
                $http.get('http://tw06v033.ugent.be/Chronic/rest/HeadacheService/headaches?patientID='+patientID, {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var headaches = data;
                    var newHeadaches = [];
                    headaches.forEach(function (entry) {
                        var newLocations = {};
                        for(var headacheLocation in entry.locations){
                            newLocations[entry.locations[headacheLocation].key] = Boolean(entry.locations[headacheLocation].value);
                        }
                        var newHeadacheTriggers = JSON.parse(localStorage.getItem("triggers"));

                        for(var triggerID in entry.triggerIDs){
                            for(var trigger in newHeadacheTriggers){
                                if(newHeadacheTriggers[trigger].id == entry.triggerIDs[triggerID]){
                                    newHeadacheTriggers[trigger].val = true;
                                }
                            }
                        }
                        var newHeadacheSymptoms = JSON.parse(localStorage.getItem("symptoms"));
                        for(var symptomID in entry.symptomIDs){
                            for(var symptom in newHeadacheSymptoms){
                                if(newHeadacheSymptoms[symptom].id == entry.symptomIDs[symptomID]){
                                    newHeadacheSymptoms[symptom].val = true;
                                }
                            }
                        }
                        newHeadaches.push({id: entry.headacheID, end: entry.end, intensityValues: entry.intensityValues, location: newLocations,
                                           symptoms: newHeadacheSymptoms, triggers: newHeadacheTriggers});
                    });
                    localStorage.setItem("headacheList", JSON.stringify(newHeadaches));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var headaches = JSON.parse(localStorage.getItem("headacheList"));
                    if (headaches == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getMedicinesFromDB = function(){
        return new Promise(
            function (resolve, reject) {
                var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
                $http.get('http://tw06v033.ugent.be/Chronic/rest/MedicineService/medicines?patientID='+patientID, {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var medicines = data;
                    var newMedicines = [];
                    medicines.forEach(function (entry) {
                        var drugID = entry.drugID;
                        var date = new Date(entry.date);
                        var quantity = entry.quantity;
                        var drugList = JSON.parse(localStorage.getItem("drugList"));
                        var drug = {};
                        for(var aDrug in drugList){
                            console.log(drugList[aDrug]);
                            console.log(drugID);
                            if(drugList[aDrug].id == drugID) drug = drugList[aDrug];
                        }
                        newMedicines.push({drug: drug, quantity: quantity, date: date})
                    });
                    localStorage.setItem("medicineList", JSON.stringify(newMedicines));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var medicines = JSON.parse(localStorage.getItem("medicineList"));
                    if (medicines == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getDBStatus = function(){
        return new Promise(
            function(resolve, reject){
                $http.get('http://tw06v033.ugent.be/Chronic/rest/DBService/status').
                success(function (data, status, headers, config) {
                    resolve();
                }).error(function (data, status, headers, config) {
                    reject();
                });
            }
        );
    };

    var syncDB = function () {
        return Promise.all([getDrugsFromDB(), getSymptomsFromDB(), getTriggersFromDB(),
                            getHeadachesFromDB(), getMedicinesFromDB()]);
    };


    var setMedicineList = function (list) {
        medicineList = list;
        localStorage.setItem("medicineList", JSON.stringify(list));
    };

    var setHeadacheList = function (list) {
        headacheList = list;

        localStorage.setItem("headacheList", JSON.stringify(list));
    };

    var getSymptoms = function () {
        return JSON.parse(localStorage.getItem("symptoms"));
    };

    var getTriggers = function () {
        return JSON.parse(localStorage.getItem("triggers"));
    };

    var setAdvice = function (advice) {
        localStorage.setItem("advice", JSON.stringify(advice));
    };

    var getAdvice = function () {
        return JSON.parse(localStorage.getItem("advice"));
    };

    var getDrugs = function () {
        return JSON.parse(localStorage.getItem("drugList"));
    };

    var addDrug = function (drugName) {
        inList = false;
        for (drug in JSON.parse(localStorage.getItem("drugList"))) {
            if (JSON.parse(localStorage.getItem("drugList")[drug].name == drugName)) inList = true;
        }
        if (!inList) {
            var drug = {
                id: JSON.parse(localStorage.getItem("drugList"))[JSON.parse(localStorage.getItem("drugList")).length - 2].id + 1,
                name: drugName,
                description: ""
            };
            var list = JSON.parse(localStorage.getItem("drugList"));
            list = list.splice(list.length - 1, 0, drug);
            localStorage.setItem("drugList", JSON.stringify(list));
        }
    };

    var removeHeadache = function () {
        var list = JSON.parse(localStorage.getItem("headacheList"));
        var current = JSON.parse(localStorage.getItem("currentHeadache"));

        var index = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].intensityValues[0].key == current.intensityValues[0].key) {
                index = i;
                break;
            }
        }

        localStorage.setItem("headacheList", JSON.stringify(list));
        headacheList = list;

        currentHeadache = null;
        localStorage.setItem("currentHeadache", JSON.stringify(null));

    };

    var removeMedicine = function () {
        var list = JSON.parse(localStorage.getItem("medicineList"));
        var current = JSON.parse(localStorage.getItem("currentMedicine"));

        var index = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].drug.name == current.drug.name && list[i].quantity == current.quantity && list[i].date == current.date) {
                index = i;
                break;
            }
        }

        localStorage.setItem("medicineList", JSON.stringify(list));
        medicineList = list;

        currentMedicine = null;
        localStorage.setItem("currentMedicine", JSON.stringify(null));
    };

    var clearCache = function () {
        localStorage.clear();

    };

    var getHeadachesNoEnd = function () {
        var listItems = getHeadacheList();
        var listNoEnd = [];
        if (listItems != null) {
            listItems.sort(function (a, b) { //sort the list on their start dates // date of consumption

                dateA = a.intensityValues[0].key;
                dateB = b.intensityValues[0].key;
                return (new Date(dateA.toString())) - (new Date(dateB.toString()));
            });


            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].end == null) {
                    listNoEnd.push(listItems[i]);
                }
            }
        }

        return listNoEnd;

    };

    var addDailyMedicine = function (medicine) {
        dailyMedicine = JSON.parse(localStorage.getItem("dailyMedicine"));
        if (dailyMedicine == null) {
            dailyMedicine = [];
        }
        dailyMedicine.push(medicine);
        localStorage.setItem("dailyMedicine", JSON.stringify(dailyMedicine));
    };

    var getDailyMedicines = function () {
        if (JSON.parse(localStorage.getItem("dailyMedicine") == null)) {
            localStorage.setItem("dailyMedicine", JSON.stringify([]));
        }
        JSON.parse(localStorage.getItem("dailyMedicine")).forEach(function (s) {

        });

        return JSON.parse(localStorage.getItem("dailyMedicine"));
    };

    var setDailyMedicineList = function (list) {
        localStorage.setItem("dailyMedicine", JSON.stringify(list));
        list.forEach(function (s) {
            var medicine;
            //medicine.patientID = dataService.get
            $http.post('http://tw06v033.ugent.be/Chronic/rest/MedicineService/medicines', {headers: {'Authorization': getAuthorization()}}).
            success(function (data, status, headers, config) {
                alert("CONNECTED TO INTERNET OR DATABASE " + status)
                // Get advice for patient

                // Get new drugs

                // Get new symptoms
                var symptomsList = JSON.parse(localStorage.getItem("symptoms"));
                if (symptomsList == null) symptomsList = [];
                $http({method: 'GET', url: 'http://tw06v033.ugent.be/Chronic/rest/SymptomService/symptoms'}).
                success(function (data, status, headers, config) {
                    //alert(""+data);
                    symptoms = data;
                    symptoms.forEach(function (entry) {
                        entry["val"] = false;
                    });
                    symptomsList.push.apply(symptoms);
                    localStorage.setItem("symptoms", JSON.stringify(symptomsList));
                }).
                error(function (data, status, headers, config) {
                    alert("error retrieving symptoms from database")
                });

                // Get new triggers
            }).
            error(function (data, status, headers, config) {
                alert("NO INTERNET OR DATABASE CONNECTION " + status)
            });
        });
    };

    var getPasswordHash = function () {
        passwordHash = JSON.parse(localStorage.getItem("passwordHash"));
        return passwordHash;
    };

    var setEmail = function (user) {
        email = user;
        localStorage.setItem("email", JSON.stringify(user));
    };

    var getEmail = function () {
        email = JSON.parse(localStorage.getItem("email"));
        if (email == null)
            email = "";
        return email;
    };

    var registerUser = function (_firstname, _lastname, _birthdate, _sex, _status, _employment, _email, _sha3, _patientID) {
        var user = {
            firstname: _firstname, lastname: _lastname, birthdate: _birthdate, sex: _sex, status: _status,
            employment: _employment, email: _email, passwordHash: _sha3, patientID: _patientID
        };
        localStorage.setItem("currentUser", JSON.stringify(user));
        //TODO: register on the server or check if server already has this shit
        /*
         localStorage.setItem("firstname", JSON.stringify(firstname));
         localStorage.setItem("lastname",JSON.stringify(lastname));
         localStorage.setItem("birthdate",JSON.stringify(birthdate));
         localStorage.setItem("sex",JSON.stringify(sex));
         localStorage.setItem("status", JSON.stringify(status));
         localStorage.setItem("employment",JSON.stringify(employment));
         localStorage.setItem("email", JSON.stringify(email));
         localStorage.setItem("passwordHash",JSON.stringify(sha3));
         */
    };

    var getApiKey = function () {
        return "FiFoEdUdLOI4D19lj7Vb5pi72dDZf2aB";
    };

    return {
        addHeadache: addHeadache,
        addMedicine: addMedicine,
        getHeadacheList: getHeadacheList,
        getMedicineList: getMedicineList,
        setMedicineList: setMedicineList,
        setHeadacheList: setHeadacheList,
        setCurrentHeadache: setCurrentHeadache,
        setCurrentMedicine: setCurrentMedicine,
        getCurrentHeadache: getCurrentHeadache,
        getCurrentMedicine: getCurrentMedicine,
        getSymptoms: getSymptoms,
        getTriggers: getTriggers,
        removeHeadache: removeHeadache,
        clearCache: clearCache,
        removeMedicine: removeMedicine,
        getHeadachesNoEnd: getHeadachesNoEnd,
        addDailyMedicine: addDailyMedicine,
        getDailyMedicines: getDailyMedicines,
        setDailyMedicineList: setDailyMedicineList,
        getDrugs: getDrugs,
        addDrug: addDrug,
        getPasswordHash: getPasswordHash,
        getEmail: getEmail,
        setEmail: setEmail,
        registerUser: registerUser,
        getApiKey: getApiKey,
        getAuthorization: getAuthorization,
        setAdvice: setAdvice,
        getAdvice: getAdvice,
        syncDB: syncDB,
        getDBStatus: getDBStatus,
        sendHeadacheToDB: sendHeadacheToDB

    };


});
