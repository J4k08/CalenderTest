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

    .controller('gapiController', function($scope, $document, $mdDialog, $timeout) {

    "use strict";
    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        clientId: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar"
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

    function initClient() {
        gapi.client.init(apiKey).then(function() {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.on('click', handleAuthClick);
            signoutButton.on('click', handleSignoutClick);
        });
    }

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

    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    function listUpcomingEvents(eventsArray) {
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
                        eventsArray[i] = event;
                    });
                    })();
                }
            } else {
                $scope.clearEventsList();
            }
        });
    }

    $scope.updateCalEvents = function() {

        listUpcomingEvents($scope.events);
    };
    $scope.getCurrentEvent = function($event, event) {

        $scope.displayEvent(true);
        $scope.currentEvent = event;
        $scope.dash = " - ";
        $scope.displayButton(true);

    };
    $scope.clearEventsList = function() {

        $scope.events = [];
        $scope.dash = "";
        $scope.currentEvent = [];
        $scope.displayButton(false)
    };
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

    setInterval(function() {

        listUpcomingEvents($scope.events);

    }, 10000);

    $scope.createEvent = function() {

        $scope.displayEvent(false);
        $scope.displayButton(false);

        var dates = [$scope.momentStart, $scope.momentEnd];
        var isoDates = $scope.convertToIso(dates);

        $scope.newEvent = {
            'summary': $scope.eventTitle  + " - " + $scope.eventName,
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

        request.execute(function(event) {
            listUpcomingEvents($scope.events);
        });
        $scope.eventName = "";
        $scope.eventTitle = "";
    };

    $scope.displayEvent = function(bool) {

        if(bool) {
            currentEventField.css('display', 'block');
            newEventField.css('display', 'none');
        } else {
            currentEventField.css('display', 'none');
            newEventField.css('display', 'block');
        }
    };
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
    $scope.deleteEvent = function(event) {

        var request = gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': event.id
        });
        request.execute(function() {
            $scope.$apply(function() {
                $scope.currentEvent = [];
                $scope.dash = " ";
                $scope.displayButton(false);
            });
        });
        $scope.updateCalEvents();
    };
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

    $scope.displayEvent(true);
});
    /*
     1: Skriv om gapi.js till angular                           [ Check ]
     2: Skapa node server - klar                                [ Check ]
     3: Kör googleApi när en homepage visas,                    [ Check ]
     4: Hämta event                                             [ Check ]
     5: Skapa en enklare frontend och visa events               [ Check ]
     7: Skapa timer som hämtar hem från googleApi               [ Check ]
     6: Ta bort event
     7: Uppdatera event
     8: Lägg till input field för custom event
     */