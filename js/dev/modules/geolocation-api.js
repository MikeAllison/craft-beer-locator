/*************************************************************************************************
  Code related to Google Geocoding API
  This could be performed using a Google Maps object but I wanted to practice using AJAX requests
**************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  /******************************************************************************************
    getGeocode() - Takes a city, state and converts it to lat/lng using Google Geocoding API
  *******************************************************************************************/
  app.controllers.getGeocode = function() {
    return new Promise(function(resolve, reject) {
      var tboxVal = app.views.form.cityStateTbox.value;
      if (!tboxVal) {
        reject({ type: 'error', text: 'Please enter a location.' });
        return;
      }

      // AJAX request for lat/lng for form submission
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status !== 200) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          var response = JSON.parse(httpRequest.responseText);
          if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
            reject({ type: 'error', text: 'Sorry, that location could not be found.' });
            return;
          }

          app.models.searchLoc.lat = response.results[0].geometry.location.lat;
          app.models.searchLoc.lng = response.results[0].geometry.location.lng;
          app.models.searchLoc.setFormattedAddress(response.results[0].formatted_address);
          resolve();
        }
      };

      httpRequest.send();
    });
  };

  /******************************************************
    reverseGeocode() - Converts lat/lng to a city, state
  *******************************************************/
  app.controllers.reverseGeocode = function(lat, lng) {
    return new Promise(function(resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&latlng=' + lat + ',' + lng;

      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);
      httpRequest.send();

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status !== 200) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          var response = JSON.parse(httpRequest.responseText);

          resolve(response);
        }
      };
    });
  };

})();
