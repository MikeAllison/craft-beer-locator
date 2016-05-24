// Start the app

$(function() {

  // Set defaults on variables to control flow of search
  this.newSearch = true;

  // Initialize config, models, & views
  app.config.init();
  app.models.searchLoc.init();
  app.models.places.init();
  app.views.page.init();
  app.views.map.init();
  app.views.form.init();
  app.views.locationBtn.init();
  app.views.alerts.init();
  app.views.results.init();
  app.views.recentSearches.init();
  app.views.placeModal.init();
  app.views.moreResultsBtn.init();

});
