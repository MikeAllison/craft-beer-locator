(function() {

  var httpRequest;

  document.getElementById('cityStateForm').addEventListener('submit', function(event) {
    event.preventDefault();
  });

  document.getElementById('submitButton').onclick = function() {
    var cityState = document.getElementById("cityState").value;
    getLocation(cityState);
  };

  function getLocation(cityState) {
    var apiKey = 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
    var params = '?key=' + apiKey + '&address=' + encodeURIComponent(cityState);
    var url = 'https://maps.googleapis.com/maps/api/geocode/json' + params;

    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert('Sorry, your request could not be completed.');
      return false;
    }

    httpRequest.onload = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var response = JSON.parse(httpRequest.responseText);
          var bounds = response.results[0].geometry.bounds;
          //var lat = response.results[0].geometry.location.lat;
          //var lng = response.results[0].geometry.location.lng;
          listNearbyPlaces(bounds);
        } else {
          alert('Sorry, please try again.');
        }
      }
    };

    httpRequest.open('GET', url, true);
    httpRequest.send();
  }

  function listNearbyPlaces(bounds) {

    var latLngBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
      new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng)
    );

    var params = {
      bounds: latLngBounds,
      type: 'university'
    };

    resultsList = new google.maps.Map(document.getElementById("results-list"));
    service = new google.maps.places.PlacesService(resultsList);
    service.nearbySearch(params, function(results, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        alert('Sorry, please try again.');
        return;
      }
      console.log(results);
    });
  }

})();
