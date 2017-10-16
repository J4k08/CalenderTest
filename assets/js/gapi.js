/**
 * Created by jakobhaglof on 2017-10-02.
 */

angular.module('app', ['ngMaterial', 'ngRoute', 'ds.clock'])

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
                'default': '400',
                'hue-1': '200',
                'hue-2': '600'
            })
            .accentPalette('green', {
                'default': '500'
            });
    })
    .controller('gapiController', function($scope, $document, $mdDialog) {

        $scope.events = [];
        $scope.currentEvent = [];

        $scope.eventTitle = "";
        $scope.eventName = "";
        $scope.eventStart = "";
        $scope.eventEnd = "";


        $scope.testEvent = {
            'summary': 'testEvent - Jakob',
            'creator': {
                'displayName': "Jakob",
                'email': "j.haglof56@gmail.com",
                'self': true
            },
            'description': 'roomdisplay',
            'start': {
                'dateTime': '2017-10-10T09:00:00-07:00',
                'timeZone': 'Europe/Amsterdam'
            },
            'end': {
                'dateTime': '2017-10-10T10:00:00-07:00',
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

    "use strict";
    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        clientId: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar"
    };
    //var discovery_Docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    //var client_Id = "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com";
    //var scopes = "https://  www.googleapis.com/auth/calender.readonly";
    console.log($document);
    var authorizeButton = angular.element(document.querySelector("#authorize-button"));
    var signoutButton = angular.element(document.querySelector("#signout-button"));
    var extendButton = angular.element(document.querySelector("#extendButton"));
    var endEarlyButton = angular.element(document.querySelector("#endEarlyButton"));
    var deleteButton = angular.element(document.querySelector("#deleteButton"));

    console.log("auth");
    gapi.load('client:auth2', initClient);

    function initClient() {
        console.log("init");
        gapi.client.init(apiKey).then(function() {
            console.log("init.then");
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.on('click', handleAuthClick);
            signoutButton.on('click', handleSignoutClick);
        });
    }

    function updateSignInStatus(isSignedIn) {
        console.log("updateSigninStatus");
        if (isSignedIn) {

            //enable get events knapp
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
        console.log("handleAuthClick");
    }

    function handleSignoutClick(event) {
        console.log("Signout");
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
                        console.log(eventsArray[i])
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

            console.log("true");
            deleteButton.css('visibility', 'visible');
            endEarlyButton.css('visibility', 'visible');
            extendButton.css('visibility', 'visible');
        } else {

            console.log("false");
            deleteButton.css('visibility', 'hidden');
            endEarlyButton.css('visibility', 'hidden');
            extendButton.css('visibility', 'hidden');
        }
    };
    setInterval(function() {

        listUpcomingEvents($scope.events);

    }, 10000);

    $scope.createEvent = function(event) {

        var request = gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });

        request.execute(function(event) {
            console.log("testEvent: " + event);
            listUpcomingEvents($scope.events);
        });
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
            console.log("createEvent request.execute");
            $scope.$apply(function() {
                $scope.currentEvent = [];
                $scope.dash = " ";
                $scope.displayButton(false);
                $scope.updateCalEvents();
            });
        });
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