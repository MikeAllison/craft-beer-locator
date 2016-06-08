// Code related to updating views

(function() {

  app.controllers = app.controllers || {};

  // updatePage - Updates list of results and recent searches
  app.controllers.updatePage = function() {
    var places = app.models.places.get();

    app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');

    // Set placeholder attribute on textbox
    app.views.form.setTboxPlaceholder();

    // Render views with updated results
    app.views.recentSearches.render();
    app.views.results.render();
  };

  // updateModal - Updates model when a place is selected
  app.controllers.updateModal = function() {
    return new Promise(function(resolve) {
      app.views.placeModal.populate();
      app.views.placeModal.show();
      resolve();
    });
  };

})();
