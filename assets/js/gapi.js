/**
 * Created by jakobhaglof on 2017-10-02.
 */

angular.module('app', ['ngMaterial', 'ngRoute', 'ds.clock', 'moment-picker'])

    .config(function($routeProvider) {

        $routeProvider
            .when("/", {
                templateUrl: "views/calenderEvents.html",
                controller: "gapiController"
        });
    })
    .config(function($mdThemingProvider) {

        $mdThemingProvider.theme('default')
            .primaryPalette('green', {
                'default': '700',
                'hue-1': '400',
                'hue-2': '800'
            })
            .accentPalette('green', {
                'default': '600'
            });
    })
    .config(['momentPickerProvider', function(momentPickerProvider) {
        momentPickerProvider.options({
            minutesStep: 15
        });
    }])

    .controller('gapiController', function($scope, $document, $mdDialog, $timeout, $mdToast) {

    "use strict";
    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        clientId: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar"
    };
        $scope.moment = {

            start:"",
            end:""
        };
        $scope.events = [];
        $scope.currentEvent = [];

        //buttons
        var authorizeButton = angular.element(document.querySelector("#authorize-button"));
        var signoutButton = angular.element(document.querySelector("#signout-button"));
        var extendButton = angular.element(document.querySelector("#extendButton"));
        var endEarlyButton = angular.element(document.querySelector("#endEarlyButton"));
        var deleteButton = angular.element(document.querySelector("#deleteButton"));

        //fields
        var newEventField = angular.element(document.querySelector("#newEvent"));
        var currentEventField = angular.element(document.querySelector("#mainPageCurrentEvent"));


    gapi.load('client:auth2', initClient);

    //Initiates gapi client, checks if api-key is valid.
    function initClient() {
        gapi.client.init(apiKey).then(function() {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.on('click', handleAuthClick);
            signoutButton.on('click', handleSignoutClick);
        });
    }

    //If signed in on google, auth-buttons are visible, else hidden
    function updateSignInStatus(isSignedIn) {

        if (isSignedIn) {

            authorizeButton.css('visibility', 'hidden');
            signoutButton.css('visibility', 'visible');
            listUpcomingEvents($scope.events);
        } else {

            authorizeButton.css('visibility', 'visible');
            signoutButton.css('visibility', 'hidden');
        }
    }

    //Click function for signing in
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    //Click function for signing out
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    //Removes currentEvent from event-array
    function removeById(arr, current) {

        for(var i = 0; i < arr.length; i++) {
            if(arr[i].id === current.id) {
                arr.splice(i,1)
            }
        }
    }

    //Fetches events from google calender and adds them to event-array
    function listUpcomingEvents() {
        gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        }).then(function(response) {

            var events = response.result.items;
            if (events.length > 0) {
                for (var i = 0; i < events.length; i++) {
                    (function(){
                    var event = events[i];
                    var when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    $scope.$apply(function() {
                        $scope.events[i] = event;
                    });
                    })();
                }
                if(!compareEvents(events, $scope.events)) {
                    $scope.events = events;
                }
            } else {
                $scope.clearEventsList();
            }
        });
    }

    //Updates calenderArray, looks for changes
    $scope.updateCalEvents = function() {

        listUpcomingEvents();
    };

    //sets the clicked event to currentEvent
    $scope.getCurrentEvent = function($event, event) {

        $scope.displayEvent(true);
        $scope.currentEvent = event;
        $scope.dash = " - ";
        $scope.displayButton(true);
    };

    //Clears event field, hides buttons
    $scope.clearEventsList = function() {

        $scope.events = [];
        $scope.dash = "";
        $scope.currentEvent = [];
        $scope.displayButton(false)
    };

    //displays buttons if bool is true, hides if false
    $scope.displayButton = function (bool) {

        if(bool) {

            deleteButton.css('visibility', 'visible');
            endEarlyButton.css('visibility', 'visible');
            extendButton.css('visibility', 'visible');
        } else {

            deleteButton.css('visibility', 'hidden');
            endEarlyButton.css('visibility', 'hidden');
            extendButton.css('visibility', 'hidden');
        }
    };

    //Checks for changes every 10th second
    setInterval(function() {

        $scope.updateCalEvents();

    }, 10000);

    //Creates new event
    $scope.createEvent = function() {

        $scope.displayEvent(false);
        $scope.displayButton(false);

        if($scope.moment.start === "" || $scope.moment.end === "" || $scope.moment.start == null || $scope.moment.end == null) {
            showToast('Please set Start and End time');
        } else {

            if($scope.event.title == null || $scope.event.title === "") {
                $scope.event.title = "Quickbook"
            }
            if($scope.event.name == null || $scope.event.name === "") {
                $scope.event.name = "Unknown"
            }

            var dates = [$scope.moment.start, $scope.moment.end];
            var isoDates = $scope.convertToIso(dates);

            $scope.newEvent = {
                'summary': $scope.event.title + " - " + $scope.event.name,
                'creator': {
                    'displayName': "Jakob",
                    'email': "j.haglof56@gmail.com",
                    'self': true
                },
                'description': 'roomdisplay',
                'start': {
                    'dateTime': isoDates[0],
                    'timeZone': 'Europe/Amsterdam'
                },
                'end': {
                    'dateTime': isoDates[1],
                    'timeZone': 'Europe/Amsterdam'
                },
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10}
                    ]
                }
            };

            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });

            request.execute(function (event) {
                listUpcomingEvents($scope.events);
            });
        }

        $scope.event = {
            name: "",
            title: ""
        };
        $scope.moment = {
            start:"",
            end: ""
        }
    };

    //displays event if true. If false hides
    $scope.displayEvent = function(bool) {

        if(bool) {
            currentEventField.css('display', 'block');
            newEventField.css('display', 'none');
        } else {
            currentEventField.css('display', 'none');
            newEventField.css('display', 'block');
        }
    };

    //click-function, displays prompt message
    $scope.showPrompt = function(ev) {

        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove meet?')
            .textContent('This will permanently remove it')
            .targetEvent(ev)
            .ok('Remove this muddah')
            .cancel('Keep meeting');

        $mdDialog.show(confirm).then(function() {
                $scope.status = 'Meeting removed!';
                $scope.deleteEvent($scope.currentEvent);
        }, function() {
            $scope.status = 'Meeting still active!'
        });
     };

    //Deletes currentEvent from google Calender
    $scope.deleteEvent = function(event) {

        var request = gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': event.id
        });
        request.execute(function() {
            $scope.$apply(function() {
                removeById($scope.events, $scope.currentEvent);
                $scope.currentEvent = [];
                $scope.dash = " ";
                $scope.displayButton(false);
            });
        });
        $scope.updateCalEvents();
    };

    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('top center')
                .hideDelay(3000)
        );
    }

    //Convert Date to isoObject
    $scope.convertToIso = function(array) {

        var today= new Date();

        var startHours = array[0].substring(0,2);
        var startMinutes = array[0].substring(3,5);
        var endhours = array[1].substring(0,2);
        var endMinutes = array[1].substring(3,5);

        var date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHours, startMinutes, 0);
        array[0] = date.toISOString();

        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endhours, endMinutes, 0);
        array[1] = date;

        return array;
    };

    //on-click function, extends event with an hour
    $scope.extendEvent = function() {

           var date = new Date($scope.currentEvent.end.dateTime);
           date.setHours(date.getHours() + 1);

           $scope.currentEvent.end.dateTime = date.toISOString();

           var request = gapi.client.calendar.events.patch({
               'calendarId':'primary',
               'eventId': $scope.currentEvent.id,
               'resource': $scope.currentEvent
           });

           request.execute(function(event) {
               console.log('Event extended: ' + event.htmlLink);

               $scope.updateCalEvents();
               showToast("Meeting extended an hour!")
           })
        };

    $scope.displayEvent(true);

    //Compares two arrays and checks for changes in arrays, returns true if arrays are identical
    function compareEvents(arrayX, arrayY) {

        if(arrayX.length !== arrayY.length) {
            return false;
        }else {

            for(var i = 0; i < arrayX.length; i++) {

                for(var e = 0; e < arrayY.length; e++) {

                    if(arrayX[i].id === arrayY[e].id) {
                        e = arrayY.length;
                    } else {
                        return false;
                    }
                }
            }
        }
        return true;
    }
});
    /*
     1: Skriv om gapi.js till angular                           [ Check ]
     2: Skapa node server - klar                                [ Check ]
     3: Kör googleApi när en homepage visas,                    [ Check ]
     4: Hämta event                                             [ Check ]
     5: Skapa en enklare frontend och visa events               [ Check ]
     7: Skapa timer som hämtar hem från googleApi               [ Check ]
     6: Ta bort event                                           [ Check ]
     7: Uppdatera event
     8: Lägg till input field för custom event                  [ Check ]
     */