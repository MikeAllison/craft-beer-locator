(function() {

  var httpRequest;
  resultsDiv = document.getElementById('results');

  function clearResults() {
    while (resultsDiv.firstChild) {
      resultsDiv.removeChild(resultsDiv.firstChild);
    }
  }

  document.getElementById('submitButton').onclick = function() {
    var cityState = document.getElementById('cityState').value;
    getLocation(cityState);
    clearResults();
  };

  // Send form data to Google Geocoding API
  function getLocation(cityState) {
    var apiKey = 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
    var params = '?key=' + apiKey + '&address=' + encodeURIComponent(cityState);
    var url = 'https://maps.googleapis.com/maps/api/geocode/json' + params;

    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      // REFACTOR - Change to flash notice
      alert('Sorry, your request could not be completed.');
      return false;
    }

    httpRequest.onload = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var response = JSON.parse(httpRequest.responseText);
          var bounds = response.results[0].geometry.bounds;
          listNearbyPlaces(bounds);
        } else {
          // REFACTOR - Change to flash notice
          alert('Sorry, please try again.');
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

  // Updates the results on the DOM (results & status are passed from .nearbySearch)
  function addResultsToDom(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      // REFACTOR - Change to flash notice
      alert('Sorry, please try again.');
      return;
    }

    var newH5 = document.createElement('h5');
    headingText = document.createTextNode('Results');
    newH5.appendChild(headingText);

    var newUl = document.createElement('ul');
    newUl.setAttribute('id', 'resultsList')
    newUl.classList.add('list-unstyled');

    for (var i = 0; i < results.length; i++) {
      var newLi = document.createElement('li');
      var result = document.createTextNode(results[i].name);
      newLi.appendChild(result);
      newUl.appendChild(newLi);
    }

    // Adds the new heading to div#results
    resultsDiv.appendChild(newH5);

    // Adds the new ul to div#results
    resultsDiv.appendChild(newUl);
  }

})();
