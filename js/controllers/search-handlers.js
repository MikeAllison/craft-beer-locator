// Code related to controlling the flow of searches

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // formSearch - Controls the flow of a search initiated by the form
  app.controllers.formSearch = function() {
    app.models.userLocation.init();
    app.controllers.getGeocode()
      .then(app.controllers.requestPlaces)
      .then(app.controllers.sortPlaces)
      .then(app.controllers.requestDistance)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons);
  };

  // geolocationSearch - Controls the flow of a search initiated by the 'My Location' button
  app.controllers.geolocationSearch = function() {
    app.models.searchLocation.init();
    app.controllers.getCurrentLocation()
      .then(app.controllers.reverseGeocode)
      .then(app.controllers.requestPlaces)
      .then(app.controllers.sortPlaces)
      .then(app.controllers.requestDistance)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons);
  };

  // recentSearch - Controls the flow of a search initiated by clicking a location in Recent Searches
  app.controllers.recentSearch = function(location) {
    app.models.userLocation.init();
    app.controllers.setSearchLocation(location);
    app.controllers.requestPlaces()
      .then(app.controllers.sortPlaces)
      .then(app.controllers.requestDistance)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons);
  };

  // getDetails - Controls the flow for acquiring details when a specific place is selected
  app.controllers.getDetails = function(place) {
    var requestedPlace = app.models.places.find(place);
    app.controllers.setSelectedPlaceDetails(requestedPlace)
      .then(app.controllers.requestPlaceDetails)
      .then(app.controllers.requestDrivingDistance)
      .then(app.controllers.requestTransitDistance)
      .then(app.controllers.updateModal);
  };

  // getMyDistance - Requests distance from your location to a place (triggered from itemModal)
  app.controllers.getMyDistance = function() {
    app.controllers.getCurrentLocation()
      .then(app.controllers.requestDrivingDistance)
      .then(app.controllers.requestTransitDistance)
      .then(app.controllers.updateModal)
      .then(app.controllers.requestDistance)
      .then(app.controllers.updatePage);
  };

  // requestMoreResults - Requests more results if > 20 results are returned
  app.controllers.requestMoreResults = function() {
    var paginationObj = app.models.places.paginationObj;
    paginationObj.nextPage();
    // TO-DO: Fix this hack
    // Need to wait for AJAX request to finish before moving on and can't use JS promise
    window.setTimeout(function() {
      app.controllers.requestDistance()
        .then(app.controllers.sortPlaces)
        .then(app.controllers.updatePage)
        .then(app.views.page.enableButtons);
    }, 2000);
  };

})();
