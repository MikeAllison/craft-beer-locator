/*******************************
  Code for the form and buttons
********************************/

(function() {

  app.views = app.views || {};

  // City/State Form
  app.views.form = {
    init: function() {
      // Collect DOM elements
      this.cityStateTbox = document.getElementById('cityStateTbox');
      this.searchBtn = document.getElementById('searchBtn');
      // Set default values
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
          $('#resultsTab').tab('show');
          app.controllers.formSearch();
        }
      });
      this.searchBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        $('#resultsTab').tab('show');
        app.controllers.formSearch();
      });
    },
    setTboxPlaceholder: function() {
      this.cityStateTbox.value = null;
      this.cityStateTbox.setAttribute('placeholder', app.models.searchLoc.cityState());
    },
    disableSearchBtn: function() {
      this.searchBtn.setAttribute('disabled', true);
    },
    enableSearchBtn: function() {
      this.searchBtn.removeAttribute('disabled');
    }
  };

  // Location Button
  app.views.locationBtn = {
    init: function() {
      // Collect DOM elements
      this.locationBtn = document.getElementById('locationBtn');
      // Add click handlers
      this.locationBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        $('#resultsTab').tab('show');
        app.controllers.geolocationSearch();
      });
    },
    disable: function() {
      this.locationBtn.setAttribute('disabled', true);
    },
    enable: function() {
      this.locationBtn.removeAttribute('disabled');
    }
  };

  // Progress Bar
  app.views.resultsProgressSection = {
    init: function() {
      // Collect DOM elements
      this.resultsProgressSection = document.getElementById('resultsProgressSection');
      this.resultsProgressStatus = document.getElementById('resultsProgressStatus');
      this.resultsProgressBar = document.getElementById('resultsProgressBar');
      // Set default values
      this.resultsProgressSection.classList.add('hidden');
      this.resultsProgressBar.setAttribute('aria-valuenow', '0');
      this.resultsProgressBar.setAttribute('aria-valuemin', '0');
      this.resultsProgressBar.setAttribute('aria-valuemax', '100');
      this.resultsProgressBar.setAttribute('style', 'min-width: 2em; width: 0');
    },
    show: function(percent, message) {
      this.resultsProgressSection.classList.remove('hidden');
      this.resultsProgressStatus.textContent = message;
      this.resultsProgressBar.setAttribute('aria-valuenow', percent);
      this.resultsProgressBar.setAttribute('style', 'min-width: 2em; width: ' + percent + '%');
      this.resultsProgressBar.children[0].textContent = percent + '%';
    },
    hide: function() {
      this.resultsProgressSection.classList.add('hidden');
      this.resultsProgressBar.setAttribute('aria-valuenow', '0');
      this.resultsProgressBar.setAttribute('style', 'min-width: 2em; width: 0');
    }
  };

})();
