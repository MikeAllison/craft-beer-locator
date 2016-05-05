var app = app || {};

(function() {

  app.views = app.views || {};

  // City/state form
  app.views.form = {
    init: function() {
      // Collect DOM elements
      this.cityStateTbox = document.getElementById('cityStateTbox');
      this.searchBtn = document.getElementById('searchBtn');
      // Set default values on DOM elements
      this.cityStateTbox.setAttribute('autofocus', true);
      this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
      // Add click handlers
      this.cityStateTbox.addEventListener('click', function() {
        this.value = null;
      });
      this.cityStateTbox.addEventListener('keyup', function(e) {
        if (e.keyCode === 13) {
          app.views.page.disableButtons();
          app.views.page.clear();
          app.controllers.formSearch();
        }
      });
      this.searchBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        app.controllers.formSearch();
      });
    },
    setTboxPlaceholder: function() {
      this.cityStateTbox.value = null;
      this.cityStateTbox.setAttribute('placeholder', app.models.userLocation.formattedAddress || app.models.searchLocation.formattedAddress);
    },
    disableSearchBtn: function() {
      this.searchBtn.setAttribute('disabled', true);
    },
    enableSearchBtn: function() {
      this.searchBtn.removeAttribute('disabled');
    }
  };

})();
