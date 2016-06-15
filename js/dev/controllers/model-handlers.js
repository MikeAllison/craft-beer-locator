// Code related to passing data to models

(function() {

  app.controllers = app.controllers || {};

  // addRecentSearch() - Adds a location to Recent Searches after a search
  app.controllers.addRecentSearch = function() {
    app.models.recentSearches.add();
  };

  // setSelectedPlaceDetails - Sets the initial deails of the requested place for viewing details about it
  app.controllers.setSelectedPlaceDetails = function(place) {
    return new Promise(function(resolve) {
      app.models.selectedPlace.init();
      app.models.selectedPlace.placeId = place.place_id;
      app.models.selectedPlace.lat = place.geometry.location.lat;
      app.models.selectedPlace.lng = place.geometry.location.lng;
      app.models.selectedPlace.name = place.name;
      app.models.selectedPlace.setDrivingInfo(place.drivingInfo.distance, place.drivingInfo.duration);
      resolve();
    });
  };

  // setSearchLocation - Sets the location to be used by Google Places Search when a location is selected from Recent Places
  app.controllers.setSearchLocation = function(location) {
    app.models.searchLoc.lat = location.lat;
    app.models.searchLoc.lng = location.lng;
    app.models.searchLoc.setFormattedAddress(location.formattedAddress);
    app.models.searchLoc.totalItems = location.totalItems;
  };

})();
