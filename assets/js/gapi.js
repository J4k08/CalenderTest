/**
 * Created by jakobhaglof on 2017-10-02.
 */
var app = angular.module('app', ['ngRoute']);

    var apiKey= {
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        client_id: "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com",
        scopes: "https://www.googleapis.com/auth/calender.readonly"
    };
    //var discovery_Docs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    //var client_Id = "725921814233-a7hb0cpvrb5rkiicubsead57322je7dc.apps.googleusercontent.com";
    //var scopes = "https://  www.googleapis.com/auth/calender.readonly";

    authorizeButton = document.getElementById("auhorize-button");
    signoutButton = document.getElementById("signout-button");

    function handleClientLoad() {
        gapi.load('client:auth2', initClient);
    }

    function initClient() {
        console.log("init");
        gapi.client.init(apiKey).then(function() {

            console.log("init.then");
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
    }

    function updateSignInStatus(isSignedIn) {
        console.log("updateSigninStatus");
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            listUpcomingEvents();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }
    }

    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    function appendPre (message) {
        pre = document.getElementById('content');
        textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
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
    handleClientLoad();
    /*
     1: Skriv om gapi.js till angular,
     2: Skapa node server - klar
     3: Kör googleApi när en homepage visas,
     4: Skapa timer som hämtar hem från googleApi varje minut,
     5: Skapa en enklare frontend och visa events
     */

    //$scope.handleClientLoad();