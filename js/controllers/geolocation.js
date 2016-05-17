// Code related to HTML5 Geolocation

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // getCurrentLocation - HTML5 geocoding request for lat/lng for 'My Location' button
  app.controllers.getCurrentLocation = function() {
    return new Promise(function(resolve, reject) {
      var success = function(position) {
        app.models.userLoc.setLat(position.coords.latitude);
        app.models.userLoc.setLng(position.coords.longitude);
        resolve();
      };
      var error = function() {
        reject({ type: 'error', text: 'An error occurred.  Please try again.' });
        return;
      };
      var options = { enableHighAccuracy: true };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      } else {
        reject({ type: 'error', text: 'Sorry, geolocation is not supported in your browser.' });
        return;
      }
    });
  };

})();
