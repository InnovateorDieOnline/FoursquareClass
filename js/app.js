/*
* Copyright 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


/**
 *  called by the webworksready event when the environment is ready
 */
function initApp() {
	authCode = null;
	childWindow = null;
	//registerBbm();

	// setup our Foursquare credentials, and callback URL to monitor
	foursquareOptions = {
		clientId: '*',
		clientSecret: '*',
		redirectUri: '*'
	};

	// (bbUI) push the start.html page
	bb.pushScreen('start.html', 'start');
}


/**
 *  Set click handlers for the OAuth Start button 
 *  Note: window.open can only be triggered in this way, you must set a click handler for this.
 */
function setClickHandlers() {
	var link = document.getElementById('btnStart');
    link.addEventListener('click', function(e) {

  		// if the childWindow is already open, don't allow user to click the button
  		if (childWindow !== null) {
  			return false;
  		}

    	e.preventDefault();
    	toast('Contacting Foursquare...');
    	setTimeout(function(){ startOAuth(); }, 500);
  	});
}


/**
 *  Start the OAuth process by opening a childWindow, and directing the user to authorize the app
 */
function startOAuth() {

	// open the authorzation url
    var url = 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=77rjfgg564st4x&scope=r_ basicprofile%r_network&state=1968JFK25889913jazz&redirect_uri=http://www.innovateordieonline.com';
    childWindow = window.open(url, '_blank');
    console.log('code is '+ childWindow.window.location.href);

    // evaluate the url every second, when LinkedIn redirects to our callback url, the following if statements gets fired
	window.int = self.setInterval(function(){
    	var currentURL = childWindow.window.location.href;
    	var callbackURL = foursquareOptions.redirectUri;
		var inCallback = currentURL.indexOf(callbackURL);

		// location has changed to our callback url, parse the oauth code
		if (inCallback == 0) {

			// stop the interval from checking for url changes	
			window.clearInterval(int)

			// parse the oauth code
			var code = childWindow.window.location.href;
				console.log('code is '+code);
				authCode = code.split('code=');
				console.log('the authCode is '+ authCode);
				code = code[1];
			window.accessToken = code;

			// close the childWindow
			childWindow.close();
			setTimeout(function(){ 
				bb.pushScreen('connected.html', 'connected');
			}, 1000);
		}
	},1000);
}


// check-in to a venue
function checkIn(venueId, venueName) {

	// this requires an authorized call to the checkin endpoint (https://developer.foursquare.com/docs/checkins/add)
	var url = 'https://api.foursquare.com/v2/checkins/add?venueId=' + venueId + '&oauth_token=' + accessToken;

	$.ajax({
		type: 'POST',
		url: url,

		success: function() {
			toast('Checked in @ ' + venueName);
		},

		error: function(data) {
			alert('Error checking in!' + data.text);
		}
	});
}


// we use HTML5 Geolocation to pin-point where the user is
function startGeolocation() {
	setTimeout(function() {
		//toast('Searching for venues... This may take a minute.');
	}, 100);
	var options;
	setTimeout(function(){ 
		navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, options);
	}, 1000);
}


// geolocation success callback
function geoSuccess(position) {
	var gpsPosition = position;
	var coordinates = gpsPosition.coords;
	currentLat = coordinates.latitude;
	currentLong = coordinates.longitude;
	searchForVenues();
}


// geolocation failure callback
function geoFail() {
	toast('Couldn\'t get your position... using defaults');
	currentLat = 43.465187;
	currentLong = -80.522372;

	return false;
}


// search for near-by venues
function searchForVenues() {
	$('#content p').remove();
	var currentDate = getCurrentDate();

	// we don't need to do an authorized request for this endpoint (https://developer.foursquare.com/docs)
	var url = 'https://api.foursquare.com/v2/users/self/checkins?oauth_token=' + accessToken;

	$.ajax({
		type: 'GET',
		url: url,
		success: function(data) {
			var venue = data.response.checkins;
			var userCount = 0;
			//$('#content').append('<p> Venue count is: ' + venue.count + ' with the most recent checkin at: ' +venue.items[0].venue.name + '</p>');
			for (var i = 0; i < 7; i++) {  // only load 12 venues - for demo purposes
				$('#content').append('<li class="list-group-item"> I have checked into ' +venue.items[i].venue.name + ' with '+venue.items[i].venue.stats.usersCount +' classmates</li><br>');
				userCount = parseFloat(venue.items[i].venue.stats.usersCount) + userCount;
				window.userCount = userCount;
			}
			
			//$('#content').append('<li class="list-group-item"> My total classmate count is: ' + userCount +'</li>');
		},

		error: function() {
			alert('Error getting venues');
		}
	});
	
	
		console.log('the if statement worked');
	//	$('#badges').html('<div data-bb-type="item" data-bb-img="images/badge.png" data-bb-title="Badge">Congradulations</div>');
		 
	     
	
	
}

function getBadges(){
	
	var url = 'https://api.foursquare.com/v2/users/self/checkins?oauth_token=' + accessToken;
	
	$.ajax({
		type: 'GET',
		url: url,
		success: function(data) {
			var venue = data.response.checkins;
			var userCount = 0;
			//$('#content').append('<p> Venue count is: ' + venue.count + ' with the most recent checkin at: ' +venue.items[0].venue.name + '</p>');
			for (var i = 0; i < 7; i++) {  // only load 12 venues - for demo purposes
			//	$('#content').append('<p> I have checked into ' +venue.items[i].venue.name + ' with '+venue.items[i].venue.stats.usersCount +'</p>');
				userCount = parseFloat(venue.items[i].venue.stats.usersCount) + userCount;
			}
			
			//$('#content').append('<p> My total classmate count is: ' + userCount +'</p>');
		},

		error: function() {
			alert('Error getting venues');
		}
	});
	
	$('#progressBar').css('visibility','visible').hide().fadeIn().removeClass('hidden');
	
	var items = [];
	
	 var item = document.createElement('div');
    item.setAttribute('data-bb-type','item');
    item.setAttribute('data-bb-title','First MOOCup');
    item.innerHTML = 'Great job meeting your classmates in RL';
    item.setAttribute('data-bb-img','images/badge2.png');	     
    items.push(item);
    
    document.getElementById('badges').refresh(items);
}


// helper function for getting the current date, in the format foursquare is expecting it for our requests
function getCurrentDate() {
	var d = new Date();
	var year = d.getFullYear();
	var month = ("0" + (d.getMonth() + 1)).slice(-2);
	var day = ("0" + d.getDate()).slice(-2);
	var theDate = year + month + day;
	return theDate;
}


// display a toast message to the user
function toast(msg) {
   blackberry.ui.toast.show(msg);	
}

/* ==============================================================================================
 *	BBM - https://developer.blackberry.com/html5/apis/blackberry.bbm.platform.html
 * =========================================================================================== */

//var Bbmregistered = false;
//
//	// registers this application with the blackberry.bbm.platform APIs.
//	function registerBbm() {
//		console.log('inside register');
//		blackberry.event.addEventListener('onaccesschanged', function(accessible, status) {
//			if (status === 'unregistered') {
//				console.log('inside unregistered');
//				blackberry.bbm.platform.register({
//				//console.log('inside register');
//					uuid: '5b54bb3a-ab66-11e2-a242-f23c91aec05e' // unique uuid
//				});
//			} else if (status === 'allowed') {
//				Bbmregistered = accessible;
//			}
//		}, false);
//	}
//
//	// update the users personal message
//	function updateMessage() {
//		function dialogCallBack(selection) {
//			var txt = selection.promptText;
//			blackberry.bbm.platform.self.setPersonalMessage(
//				txt,
//				function(accepted) {});
//		}
//
//		// standard async dialog to get new 'personal message' for bbm
//		blackberry.ui.dialog.standardAskAsync("Enter your new status", blackberry.ui.dialog.D_PROMPT, dialogCallBack, {
//			title: "BBM"
//		});
//	}
//
//	// invite a contact to download your app via bbm
//	function inviteToDownload() {
//		blackberry.bbm.platform.users.inviteToDownload();
//	}
//
//
//
//
