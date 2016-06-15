// Code related to passing data to models

(function() {

  app.controllers = app.controllers || {};

  // setSearchLocation - Sets the location to be used by Google Places Search when a location is selected from Recent Places
  app.controllers.setSearchLocation = function(location) {
    app.models.searchLoc.lat = location.lat;
    app.models.searchLoc.lng = location.lng;
    app.models.searchLoc.setFormattedAddress(location.formattedAddress);
    app.models.searchLoc.totalItems = location.totalItems;
  };

})();
