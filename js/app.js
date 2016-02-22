(function() {

  var httpRequest;
  var alertDiv = document.getElementById('alertDiv');
  var cityStateTextbox = document.getElementById('cityStateTextbox');
  var submitButton = document.getElementById('submitButton');
  var resultsDiv = document.getElementById('results');

  // BEGIN EVENT HANDLING FUNCTIONS
  cityStateTextbox.onclick = function() {
    cityStateTextbox.value = null;
  };

  cityStateTextbox.touchstart = function() {
    cityStateTextbox.value = null;
    console.log("touch");
  };

  // Handle pressing Enter key for submission
  cityStateTextbox.onkeyup = function(event) {
    if (event.keyCode === 13) {
      submitData();
    }
  };

  // Handle clicking search button for submission
  submitButton.onclick = function() {
    submitData();
  };
  // END EVENT HANDLING FUNCTIONS

  // BEGIN USER DATA FUNCTIONS
  // Get value from textbox and process
  function submitData() {
    var cityState = cityStateTextbox.value;
    clearAlerts();
    clearResults();

    if (!cityStateTextbox.value) {
      createAlert('danger', 'Please enter a city and state.');
      return;
    }

    getLocation(cityState);
  }
  // END USER DATA FUNCTIONS

  // BEGIN GOOGLE SERVICE FUNCTIONS
  // Send form data to Google Geocoding API
  function getLocation(cityState) {
    var apiKey = 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
    var params = '?key=' + apiKey + '&address=' + encodeURIComponent(cityState);
    var url = 'https://maps.googleapis.com/maps/api/geocode/json' + params;

    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      createAlert('info', 'Sorry, please try again.');
      return false;
    }

    httpRequest.onload = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status !== 200) {
          createAlert('info', 'Sorry, please try again.');
          return;
        } else {
          var response = JSON.parse(httpRequest.responseText);

          if (!response.results[0].geometry.bounds) {
            createAlert('info', 'Sorry, that location could not be found.');
            return;
          } else {
            var bounds = response.results[0].geometry.bounds;
            listNearbyPlaces(bounds);
          }
        }
      }
    };

    httpRequest.open('GET', url, true);
    httpRequest.send();
  }

  // Send bounds from Google Geocoding API to their Google Maps Places API
  function listNearbyPlaces(bounds) {

    var latLngBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
      new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng)
    );

    var params = {
      bounds: latLngBounds,
      type: 'university'
    };

    mapDiv = new google.maps.Map(document.getElementById('map'));
    service = new google.maps.places.PlacesService(mapDiv);

    // Pass updateDom function to nearbySearch
    // !! JS allows functions to be passed as an agrument !!
    service.nearbySearch(params, addResultsToDom);
  }
  // END GOOGLE SERVICE FUNCTIONS

  // BEGIN DOM UPDATING FUNCTIONS
  function clearAlerts() {
    alertDiv.innerHTML = null;
    alertDiv.classList.add('hidden');
    alertDiv.classList.remove('alert-danger');
    alertDiv.classList.remove('alert-info');
    alertDiv.classList.remove('alert-success');
  }

  function clearResults() {
    while (resultsDiv.firstChild) {
      resultsDiv.removeChild(resultsDiv.firstChild);
    }
  }

  function createAlert(alertType, alertMessage) {
    var type = 'alert-' + alertType;
    var message = document.createTextNode(alertMessage);
    alertDiv.appendChild(message);
    alertDiv.classList.add(type);
    alertDiv.classList.remove('hidden');
  }

  // Updates the results on the DOM (results & status are passed from .nearbySearch)
  function addResultsToDom(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      createAlert('info', 'Sorry, please try again.');
      return;
    }

    var newH5 = document.createElement('h5');
    var headingText = document.createTextNode('Results');
    newH5.appendChild(headingText);

    var newUl = document.createElement('ul');
    newUl.setAttribute('id', 'resultsList');
    newUl.classList.add('list-unstyled');

    for (var i = 0; i < results.length; i++) {
      var newLi = document.createElement('li');
      var result = document.createTextNode(results[i].name);
      newLi.appendChild(result);
      newUl.appendChild(newLi);
    }

    // Add a success alert
    successMessage = 'Your search found ' + results.length + ' results.';
    createAlert('success', successMessage);

    // Adds the new heading to div#results
    resultsDiv.appendChild(newH5);

    // Adds the new ul to div#results
    resultsDiv.appendChild(newUl);
  }
  // END DOM UPDATING FUNCTIONS

})();
