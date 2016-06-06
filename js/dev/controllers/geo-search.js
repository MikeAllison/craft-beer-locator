/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    app.models.searchLoc.init();

    app.controllers.getCurrentLocation()
      .then(app.controllers.reverseGeocode)
      .then(app.controllers.reqPlaces)
      .then(app.controllers.reqMultiDistance)
      .then(app.controllers.sortPlaces)
      .then(app.controllers.addRecentSearch)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons)
      .catch(app.controllers.stopExecution);
  };

})();
