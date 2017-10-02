/**
 * Created by jakobhaglof on 2017-10-02.
 */
var app = angular.module('app', ['ngMaterial', 'ngRoute']);

app.config(function($routeProvider) {
    $routeProvider.when('/homePage', {
        controller: 'appController',
        templateUrl: 'assets/views/homePage.html'
    }).otherwise({
        controller: 'appController',
        templateUrl: 'assets/views/homePage.html'
    });
});

app.controller('appController', ['$scope', function($scope) {

    $scope.client_Id = "725921814233-g6j0kvmqbmhjogarc5hruvjukqlv17j6.apps.googleusercontent.com";
    $scope.discovery_Docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    $scope.scopes = "https://www.googleapis.com/auth/calender.readonly";

    $scope.authorizeButton = document.getElementById("auhorize-button");
    $scope.signoutButton = document.getElementById("signout-button");

    $scope.handleClientLoad = function() {
        gapi.load('client:auth2', $scope.initClient);
    };

    $scope.initClient = function() {

        gapi.client.init({
            discoveryDocs: $scope.discovery_Docs,
            clientId: $scope.client_Id,
            scope: $scope.scopes
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen($scope.updateSigninStatus);

            // Handle the initial sign-in state.
            $scope.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            //authorizeButton.onclick = handleAuthClick;
            //signoutButton.onclick = handleSignoutClick;
        });
    };

    $scope.updateSignInStatus = function(isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            listUpcomingEvents();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }
    };

    $scope.handleAuthClick = function(event) {
        gapi.auth2.getAuthInstance().signIn();
    };

    $scope.appendPre = function(message) {
        $scope.pre = document.getElementById('content');
        $scope.textContent = document.createTextNode(message + '\n');
        pre.appendChild($scope.textContent);
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

            //Kolla detta senare.

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
    }

    /*
     1: Skriv om googleApi till angular,
     2: Skapa node server,
     3: Kör googleApi när en homepage visas,
     4: Skapa timer som hämtar hem från googleApi varje minut,
     5: Skapa en enklare frontend och visa events
     */
}]);


// Client ID and API key from the Developer Console

// Array of API discovery doc URLs for APIs used by the quickstart


// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.


/**
 *  On load, called to load the auth2 library and API client library.
 */

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */


/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */


/**
 *  Sign in the user upon button click.
 */


/**
 *  Sign out the user upon button click.
 */


/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */


/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */