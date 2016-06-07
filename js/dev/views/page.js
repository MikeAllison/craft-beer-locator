/********************************************
  Code interacting with elements on the page
*********************************************/

(function() {

  app.views = app.views || {};

  // Google Map's map object (needed for API but not displayed on page)
  app.views.map = {
    init: function() {
      // Collect DOM elements
      this.map = document.getElementById('map');
    }
  };

  // Control multiple items on the page
  app.views.page = {
    init: function() {
      // Initialize page settings
      var searchItemTypeCaps = '';
      var searchItemType = app.config.settings.search.itemType.split(/\s+/);
      for (var i=0; i < searchItemType.length; i++) {
        searchItemTypeCaps += ' ' + searchItemType[i].charAt(0).toUpperCase() + searchItemType[i].slice(1);
      }
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
      window.setTimeout(function() {
        app.views.form.enableSearchBtn();
        app.views.locationBtn.enable();
      }, 250);
    }
  };

})();
