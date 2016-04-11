(function() {

  var httpRequest;
  var alertDiv = document.getElementById('alertDiv');
  var cityStateTbox = document.getElementById('cityStateTbox');
  var submitBtn = document.getElementById('submitBtn');
  var resultsDiv = document.getElementById('results');
  var moreResultsBtn = document.getElementById('moreResultsBtn');
  var showAlerts = true;

  // BEGIN EVENT HANDLING FUNCTIONS
  cityStateTbox.onclick = function() {
    cityStateTbox.value = null;
  };

  // Handle pressing Enter key for submission
  cityStateTbox.onkeyup = function(event) {
    if (event.keyCode === 13) {
      disableSubmitBtn();
      submitData();
    }
  };

  // Handle clicking search button for submission
  submitBtn.onclick = function() {
    disableSubmitBtn();
    submitData();
  };
  // END EVENT HANDLING FUNCTIONS

  // BEGIN USER DATA FUNCTIONS
  // Get value from textbox and process
  function submitData() {
    var cityState = cityStateTbox.value;
    clearAlerts();
    clearResults();

    if (!cityStateTbox.value) {
      createAlert('danger', 'Please enter a city and state.');
      enableSubmitBtn();
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
      enableSubmitBtn();
      return false;
    }

    httpRequest.onload = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status !== 200) {
          createAlert('info', 'Sorry, please try again.');
          enableSubmitBtn();
          return;
        } else {
          var response = JSON.parse(httpRequest.responseText);

          if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
            createAlert('info', 'Sorry, that location could not be found.');
            enableSubmitBtn();
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
      keyword: 'brewery'
    };

    var mapDiv = new google.maps.Map(document.getElementById('map'));
    var service = new google.maps.places.PlacesService(mapDiv);

    // Pass updateDom function to nearbySearch
    // !! JS allows functions to be passed as an agrument !!
    service.nearbySearch(params, addResultsToDom);
  }
  // END GOOGLE SERVICE FUNCTIONS

  // BEGIN DOM UPDATING FUNCTIONS
  function disableSubmitBtn() {
    submitBtn.disabled = true;
  }

  function enableSubmitBtn() {
    submitBtn.disabled = false;
  }

  function createAlert(alertType, alertMessage) {
    var type = 'alert-' + alertType;
    var message = document.createTextNode(alertMessage);
    alertDiv.appendChild(message);
    alertDiv.classList.add(type);
    alertDiv.classList.remove('hidden');
  }

  function clearAlerts() {
    showAlerts = true;
    alertDiv.innerHTML = null;
    alertDiv.classList.add('hidden');

    var alertTypes = ['alert-danger', 'alert-info', 'alert-success'];
    for (var i = 0; i < alertTypes.length; i++) {
      alertDiv.classList.remove(alertTypes[i]);
    }
  }

  function clearResults() {
    moreResultsBtn.classList.add('hidden');
    moreResultsBtn.setAttribute('disabled', 'disabled');
    while (resultsDiv.firstChild) {
      resultsDiv.removeChild(resultsDiv.firstChild);
    }
  }

  // Updates the results on the DOM (results & status are passed from .nearbySearch)
  function addResultsToDom(results, status, pagination) {
    if (status === 'ZERO_RESULTS') {
      createAlert('info', 'Sorry, no results could be found for that city and state.');
      enableSubmitBtn();
      return;
    }

    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      createAlert('info', 'Sorry, please try again.');
      enableSubmitBtn();
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

    // Add a success alert and handle > 20 results
    var totalResults = results.length;
    var successMessage;

    if (pagination.hasNextPage) {
      totalResults = 'more than 20';
      moreResultsBtn.classList.remove('hidden');

      // Google Places search requires 2 seconds between searches
      window.setTimeout(function() {
        moreResultsBtn.removeAttribute('disabled');
      }, 2000);

      moreResultsBtn.onclick = function() {
        clearResults();
        clearAlerts();
        pagination.nextPage();
        window.scroll(0, 0);
        showAlerts = false;
      };
    }

    if (showAlerts) {
      successMessage = 'Your search found ' + totalResults + ' result(s).';
      createAlert('success', successMessage);
    }

    // Adds the new heading to div#results
    resultsDiv.appendChild(newH5);

    // Adds the new ul to div#results
    resultsDiv.appendChild(newUl);

    enableSubmitBtn();
  }
  // END DOM UPDATING FUNCTIONS

})();
