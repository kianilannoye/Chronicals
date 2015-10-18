/*!
 NAAM VAN ONS PROJECT, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller for the history views.
 */


angular.module('Chronic').controller("historyController", function($scope){

    /*Hard coded events for testing purposes*/
    $scope.listItems = [
        /*
                parameters:
                            headache/mecicine 0/1
                                    headache
                                                    startDate+time
                                                    endDate+time
                                                    Intensity
                                    medicine
                                                    date+time
                                                    name of medicine
                                                    quantity
         */
        [new Date(2015,9,18, 22,30,00,0), new Date(2015,9,19,1,30,0,0), Math.random()*10],
        [new Date(2015,9,18, 14,45,0,0), "Sumatriptan", Math.random(200)],
        [new Date(2015,9,17, 14,30,00,0), new Date(2015,9,17,15,30,0,0), Math.random()*10],
        [new Date(2015,9,17, 22,30,00,0), new Date(2015,9,17,23,30,0,0), Math.random()*10],
        [new Date(2015,9,15, 22,45,00,0), new Date(2015,9,16,00,30,0,0), Math.random()*10],
        [new Date(2015,9,15, 14,30,00,0), new Date(2015,9,15,15,30,0,0), Math.random()*10],
        [new Date(2015,9,17, 00,15,0,0), "Sumatriptan", Math.random(200)]

    ];

    /* Onload fill event list of the calendar */
    $scope.fillEvents = function(){
        //document.getElementById('history').style.display = 'none';
        document.getElementById('calendar').style.display = 'block';

        for (i = 0; i < $scope.listItems.length; i++) {

            if($scope.listItems[i][1] instanceof Date ){

                $('#calendar').fullCalendar('renderEvent',
                            {   title: "Hoofdpijn"
                                , start: $scope.listItems[i][0]
                                , end: $scope.listItems[i][1]
                                , intensity: $scope.listItems[i][2]
                                , color : 'red'
                            }, true);
            }else{
                $('#calendar').fullCalendar('renderEvent',
                    {   title: "Medicijn"
                        , start: $scope.listItems[i][0]
                        , medicine: $scope.listItems[i][1]
                        , quantity: $scope.listItems[i][2]
                        ,color : 'green'
                    }, true);
            }
        }


        //$('#calendar').fullCalendar('renderEvent',
        //    eventSources= [
        //
        //        // your event source
        //        {
        //            events: [ // put the array in the `events` property
        //                {
        //                    title: 'Medicijn',
        //                    start: '2015-10-18T12:30:00'
        //                },
        //                {
        //                    title: 'Hoofdpijn',
        //                    start: '2015-10-19T12:30:00',
        //                    end: '2015-10-22T12:30:00'
        //                },
        //                {
        //                    title: 'Medicijn',
        //                    start: '2015-10-25T12:30:00'
        //                }
        //            ],
        //            color: 'black',     // an option!
        //            textColor: 'yellow' // an option!
        //        }
        //
        //        // any other event sources...
        //
        //    ]
        //, true);
    };

    window.onload = $scope.fillEvents;
    });


