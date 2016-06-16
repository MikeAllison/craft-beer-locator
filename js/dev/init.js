/***************
  Start the app
****************/

$(function() {

  app.config.init();

  app.models.searchLoc.init();
  app.models.places.init();

  app.views.page.init();
  app.views.map.init();
  app.views.form.init();
  app.views.locationBtn.init();
  app.views.alerts.init();
  app.views.resultsProgressBar.init();
  app.views.results.init();
  app.views.recentSearches.init();
  app.views.placeModal.init();

});
