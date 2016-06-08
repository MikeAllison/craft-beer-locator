
/***********************************
  Code related to HTML5 Geolocation
************************************/

(function() {

  app.controllers = app.controllers || {};

  /*************************************************************************************
    getCurrentLocation() - HTML5 geocoding request for lat/lng for 'My Location' button
  **************************************************************************************/
  app.controllers.getCurrentLocation = function() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        reject({ type: 'error', text: 'Sorry, geolocation is not supported in your browser.' });
        return;
      }

      var success = function(position) {
        resolve(position);
      };

      var error = function() {
        reject({ type: 'error', text: 'An error occurred. Please try again.' });
        return;
      };

      var options = { enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
  };

})();
