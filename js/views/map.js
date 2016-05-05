var app = app || {};

(function() {

  app.views = app.views || {};

  // Google Map's map object (needed for API but not displayed on page)
  app.views.map = {
    init: function() {
      // Collect DOM elements
      this.map = document.getElementById('map');
    }
  };

})();
