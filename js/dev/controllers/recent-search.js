/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    app.models.userLoc.init();
    app.controllers.setSearchLocation(location);

    app.controllers.reqPlaces()
      .then(app.controllers.reqMultiDistance)
      .then(app.controllers.sortPlaces)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons)
      .catch(app.controllers.stopExecution);
  };

})();
