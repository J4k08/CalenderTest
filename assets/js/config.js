/**
 * Created by jakobhaglof on 2017-10-02.
 */
var app = angular.module('app', ['ngRoute']);

//var gcal = require('google-calendar');
//var google_calendar = new gcal.GoogleCalendar(accessToken);

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'appController',
        templateUrl: 'views/homePage.html'
    }).when('/quickstart', {
        templateUrl: 'views/quickstart.html'
    });
});

app.controller('appController', function($scope) {

    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        client_id: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scopes: "https://  www.googleapis.com/auth/calender.readonly"
    };
    var discovery_Docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    var client_Id = "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com";
    var scopes = "https://  www.googleapis.com/auth/calender.readonly";

    authorizeButton = document.getElementById("auhorize-button");
    signoutButton = document.getElementById("signout-button");

    $scope.handleClientLoad = function() {
        gapi.load('client:auth2', $scope.initClient);
    };

    $scope.initClient = function() {
        console.log("init");
        gapi.client.init(apiKey).then(function() {
        }).then(function() {
            console.log("init.then");
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = $scope.handleAuthClick;
            signoutButton.onclick = $scope.handleSignoutClick;
        });
    };

        /*gapi.client.init({
            discoveryDocs: discovery_Docs,
            clientId: client_Id,
            scope: scopes
        }).then(function () {
            console.log();

            console.log("init.then");

            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen($scope.updateSignInStatus);

            // Handle the initial sign-in state.
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = $scope.handleAuthClick;
            signoutButton.onclick = $scope.handleSignoutClick;
        });*/


    function updateSignInStatus(isSignedIn) {
        console.log(isSignedIn);
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            $scope.listUpcomingEvents();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }
    };

    $scope.handleAuthClick = function(event) {
        gapi.auth2.getAuthInstance().signIn();
    };

    $scope.appendPre = function(message) {
        pre = document.getElementById('content');
        textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    };

    $scope.handleSignoutClick = function(event) {
        gapi.auth2.getAuthInstance().signOut();
    };

    $scope.listUpcomingEvents = function() {
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
            appendPre('Upcoming events:');

            if (events.length > 0) {
                for (i = 0; i < events.length; i++) {
                    var event = events[i];
                    var when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    appendPre(event.summary + ' (' + when + ')')
                }
            } else {
                appendPre('No upcoming events found.');
            }
        });

    };

    $scope.handleClientLoad();

    /*
     1: Skriv om googleApi till angular,
     2: Skapa node server,
     3: Kör googleApi när en homepage visas,
     4: Skapa timer som hämtar hem från googleApi varje minut,
     5: Skapa en enklare frontend och visa events
     */

    //$scope.handleClientLoad();
});