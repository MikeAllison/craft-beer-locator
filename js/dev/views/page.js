/********************************************
  Code interacting with elements on the page
*********************************************/

(function() {

  app.views = app.views || {};

  // Google Map's map object (needed for API but not displayed on page)
  app.views.map = {
    init: function() {
      // Collect DOM elements
      app.views.map = document.getElementById('map');
    }
  };

  // Control multiple items on the page
  app.views.page = {
    init: function() {
      // Initialize page settings
      var searchItemTypeCaps = '',
          searchItemTypes = app.config.settings.search.itemType.split(/\s+/);

      searchItemTypes.forEach(function(searchItemType, i) {
        searchItemTypeCaps += ' ' + searchItemType.charAt(0).toUpperCase() + searchItemType.slice(1);
      });

      var pageTitle = searchItemTypeCaps + ' Finder';
      
      document.title = pageTitle;
      document.getElementById('heading').textContent = pageTitle;
    },
    clear: function() {
      app.views.alerts.clear();
      app.views.results.clear();
    },
    disableButtons: function() {
      app.views.form.disableSearchBtn();
      app.views.locationBtn.disable();
    },
    enableButtons: function() {
      app.views.form.enableSearchBtn();
      app.views.locationBtn.enable();
    }
  };

})();
