/********************************************************************
  formSearch() - Controls the flow of a search initiated by the form
*********************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.formSearch = function() {
    this.newSearch = true;
    
    app.models.userLoc.init();

    app.controllers.getGeocode()
      .then(app.controllers.reqPlaces)
      .then(app.controllers.reqMultiDistance)
      .then(app.controllers.sortPlaces)
      .then(app.controllers.addRecentSearch)
      .then(app.controllers.updatePage)
      .then(app.views.page.enableButtons)
      .catch(app.controllers.stopExecution);
  };

})();
