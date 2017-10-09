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
    .controller('gapiController', function($scope, $document) {

        $scope.fetchedEvents = [];
        $scope.currentEvent = [];

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
            listUpcomingEvents($scope.fetchedEvents);
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
                        console.log("Events added to array")
                    });
                    })();
                }
                $scope.currentEvent = eventsArray[0];
                $scope.displayButton(true);

            } else {
                $scope.clearEventsList();
            }
            $scope.$apply(function() {
                $scope.convertDateTime(eventsArray);
            });
        });
    }

    $scope.convertDateTime = function(eventArray) {
        for(var i = 0; i < eventArray.length; i++) {

            var startDate = eventArray[i].start.dateTime;
            var endDate = eventArray[i].end.dateTime;

            var startIso = new Date(startDate).toISOString().substring(0,16);
            var endIso = new Date(endDate).toISOString().substring(0,16);

            eventArray[i].start.startIso = startIso;
            eventArray[i].end.endIso = endIso;
        }
    };
    $scope.updateCalEvents = function() {

        listUpcomingEvents($scope.fetchedEvents);
    };

    $scope.getCurrentEvent = function($event, event) {

        $scope.currentEvent = event;

    };
    $scope.clearEventsList = function() {

        $scope.fetchedEvents = [];
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
    }

});
    /*
     1: Skriv om gapi.js till angular                           [ Check ]
     2: Skapa node server - klar                                [ Check ]
     3: Kör googleApi när en homepage visas,                    [ Check ]
     4: Skapa timer som hämtar hem från googleApi varje minut,
     5: Skapa en enklare frontend och visa events               [ Check ]
     */