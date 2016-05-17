// Code related to updating views

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // updatePage - Updates list of results and recent searches
  app.controllers.updatePage = function() {
    return new Promise(function(resolve, reject) {
      var paginationObj = app.models.places.paginationObj;

      var places = app.models.places.get();
      if (!places) {
        app.views.alerts.show('info', 'Your request returned no results.');
        return;
      }

      // Only set location attributes and it to recent searches if it's the first request of the location
      if (app.controllers.newSearch) {
        var totalItems = places.length;

        app.models.searchLoc.setTotalItems(paginationObj.hasNextPage ? totalItems + '+' : totalItems);
        app.models.recentSearches.add();

        // Set message for alert (first request of location only)
        var msg = (!app.config.settings.search.topResultsOnly && paginationObj.hasNextPage) ? 'More than ' : '';
        app.views.alerts.show('success', msg + totalItems + ' matches! Click on an item for more details.');
      }

      // Handle > 20 matches (Google returns a max of 20 by default)
      if (!app.config.settings.search.topResultsOnly && paginationObj.hasNextPage) {
        // Prevent addition of locations to Recent Searches if more button is pressed
        app.controllers.newSearch = false;
        // Attaches click listener to moreResultsBtn for pagination.nextPage()
        app.views.moreResultsBtn.addNextPageFn(paginationObj);
        app.views.moreResultsBtn.show();
      } else {
        app.views.moreResultsBtn.hide();
      }

      // Set placeholder attribute on textbox
      app.views.form.setTboxPlaceholder();

      // Render views with updated results
      app.views.recentSearches.render();
      app.views.results.render();
      resolve();
    });
  };

  // updateModal - Updates model when a place is selected
  app.controllers.updateModal = function() {
    return new Promise(function(resolve, reject) {
      app.views.placeModal.populate();
      app.views.placeModal.show();
      resolve();
    });
  };

})();
