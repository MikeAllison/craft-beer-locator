/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    this.newSearch = true;

    app.models.searchLoc.init();

    app.controllers.getCurrentLocation()
      .then(app.controllers.reverseGeocode)
      .then(app.controllers.reqPlaces)
      .then(app.controllers.reqMultiDistance)
      .then(function() {
        var sortedResults = app.controllers.sortPlaces();
        var totalResults = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.searchLoc.setTotalItems(app.models.places.paginationObj.hasNextPage ? totalResults + '+' : totalResults);
        app.models.places.add(sortedResults);
        app.controllers.addRecentSearch();
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
