/**
 * Created by jakobhaglof on 2017-10-02.
 */

angular.module('app', ['ngMaterial', 'ngRoute'])

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
                'default': '600',
                'hue-1': '300',
                'hue-2': '100'
            })
            .accentPalette('light-green', {
                'default': '900'
            });
    })
    .controller('gapiController', function($scope, $document) {



        $scope.fetchedEvents = [];
    "use strict";
    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        clientId: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar.readonly"
    };
    //var discovery_Docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    //var client_Id = "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com";
    //var scopes = "https://  www.googleapis.com/auth/calender.readonly";
    console.log($document);
    var authorizeButton = angular.element(document.querySelector("#authorize-button"));
    var signoutButton = angular.element(document.querySelector("#signout-button"));
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
            authorizeButton.css('display', 'none');
            signoutButton.css('display', 'block');
            listUpcomingEvents();
        } else {
            authorizeButton.css('display', 'block');
            signoutButton.css('display', 'none');
        }
    }

    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    function appendPre (message) {
        console.log("message: " + message);
        $scope.content = message + '\n';
    }

    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    function listUpcomingEvents() {
        gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        }).then(function(response) {

            console.log(response.result.items);
            var events = response.result.items;
            console.log("Events: " + events[0].creator.displayName);
            appendPre('Upcoming events:');

            if (events.length > 0) {
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    appendPre(event.summary + ' (' + when + ')');
                    $scope.$apply(function() {
                        $scope.fetchedEvents.push(event);
                    });
                }

            } else {
                appendPre('No upcoming events found.');
            }
            console.log("fetchedEvents: " + $scope.fetchedEvents);
            $scope.$apply(function() {
                $scope.convertDateTime($scope.fetchedEvents);
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
        console.log("StartIso: " + startIso);
        console.log("EndIso: " + endIso);
    }
});
    /*
     1: Skriv om gapi.js till angular,
     2: Skapa node server - klar
     3: Kör googleApi när en homepage visas,
     4: Skapa timer som hämtar hem från googleApi varje minut,
     5: Skapa en enklare frontend och visa events
     */