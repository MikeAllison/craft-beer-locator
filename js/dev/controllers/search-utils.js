(function() {

  app.controllers = app.controllers || {};

  app.controllers.stopExecution = function(msg) {
    app.views.alerts.show(msg.type, msg.text);
    app.views.results.clear();
    app.views.placeModal.hide();
    app.views.page.enableButtons();
    return;
  };

  /******************************************************************************************
    getDetails() - Controls the flow for acquiring details when a specific place is selected
  *******************************************************************************************/
  app.controllers.getDetails = function(place) {
    var requestedPlace = app.models.places.find(place);

    app.controllers.setSelectedPlaceDetails(requestedPlace)
      .then(app.controllers.reqPlaceDetails)
      .then(app.controllers.reqTransitDistance)
      .then(app.controllers.updateModal)
      .catch(app.controllers.stopExecution);
  };

  /*****************************************************************************************************
    switchToGeolocation() - Requests distance from your location to a place (triggered from placeModal)
  ******************************************************************************************************/
  app.controllers.switchToGeolocation = function() {
    app.controllers.getCurrentLocation()
      .then(app.controllers.reqDrivingDistance)
      .then(app.controllers.reqTransitDistance)
      .then(app.controllers.updateModal)
      .then(app.controllers.reqMultiDistance)
      .then(function() {
        var sortedResults = app.controllers.sortPlaces();
        var totalResults = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.searchLoc.setTotalItems(app.models.places.paginationObj.hasNextPage ? totalResults + '+' : totalResults);
        app.models.places.add(sortedResults);
        app.controllers.updatePage();
      })
      .catch(app.controllers.stopExecution);
  };

  /***************************************************************************
    requestMoreResults() - Requests more results if > 20 results are returned
  ****************************************************************************/
  app.controllers.requestMoreResults = function() {
    var paginationObj = app.models.places.paginationObj;
    paginationObj.nextPage();
    // TO-DO: Fix this hack
    // Need to wait for AJAX request to finish before moving on and can't use JS promise
    window.setTimeout(function() {
      app.controllers.reqMultiDistance()
        .then(app.controllers.sortPlaces)
        .then(app.controllers.updatePage)
        .then(app.views.page.enableButtons)
        .catch(app.controllers.stopExecution);
    }, 2000);
  };

})();
