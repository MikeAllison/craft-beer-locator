// Code related to Google Geocoding API
// This could be performed using a Google Maps object but I wanted to practice using AJAX requests

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // getGeocode - Takes a city, state and converts it to lat/lng using Google Geocoding API
  app.controllers.getGeocode = function() {
    return new Promise(function(resolve, reject) {
      var tboxVal = app.views.form.cityStateTbox.value;

      if (!tboxVal) {
        app.views.alerts.show('error', 'Please enter a location.');
        app.views.page.enableButtons();
        return;
      }

      // AJAX request for lat/lng for form submission
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            var response = JSON.parse(httpRequest.responseText);

            if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
              app.views.alerts.show('error', 'Sorry, that location could not be found.');
              app.views.page.enableButtons();
              return;
            } else {
              app.models.searchLoc.setLat(response.results[0].geometry.location.lat);
              app.models.searchLoc.setLng(response.results[0].geometry.location.lng);
              app.models.searchLoc.setFormattedAddress(response.results[0].formatted_address);
            }

          } else {
            app.views.alerts.show('error', 'An error occurred.  Please try again.');
            app.views.results.clear();
            app.views.page.enableButtons();
            return;
          }
          resolve();
        }
      };

      httpRequest.send();
    });
  };

  // reverseGeocode - Converts lat/lng to a city, state
  app.controllers.reverseGeocode = function() {
    return new Promise(function(resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&latlng=' + app.models.userLoc.lat + ',' + app.models.userLoc.lng;

      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);
      httpRequest.send();

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          var response = JSON.parse(httpRequest.responseText);
          var formattedAddress = response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name;
          // Sets .formattedAddress as city, state (i.e. New York, NY)
          app.models.userLoc.setFormattedAddress(formattedAddress);
        }
        resolve();
      };
    });
  };

})();
