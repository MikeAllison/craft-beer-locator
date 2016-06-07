/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    this.newSearch = true;

    app.models.userLoc.init();
    app.controllers.setSearchLocation(location);

    app.controllers.reqPlaces()
      .then(app.controllers.reqMultiDistance)
      .then(function() {
        var sortedResults = app.controllers.sortPlaces();
        var totalResults = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.searchLoc.setTotalItems(app.models.places.paginationObj.hasNextPage ? totalResults + '+' : totalResults);
        app.models.places.add(sortedResults);
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
