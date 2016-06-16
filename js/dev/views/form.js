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
  app.views.resultsProgressBar = {
    init: function() {
      // Collect DOM elements
      this.resultsProgressBar = document.getElementById('resultsProgressBar');
      // Set default values
      this.resultsProgressBar.classList.add('hidden');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('aria-valuenow', '0');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('aria-valuemin', '0');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('aria-valuemax', '100');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('style', 'min-width: 2em; width: 0');
    },
    show: function() {
      this.resultsProgressBar.classList.remove('hidden');
    },
    update: function(percent) {
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('aria-valuenow', percent);
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('style', 'min-width: 2em; width: ' + percent + '%');
      this.resultsProgressBar.children[1].lastElementChild.textContent = percent + '%';
    },
    hide: function() {
      this.resultsProgressBar.classList.add('hidden');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('aria-valuenow', '0');
      this.resultsProgressBar.children[1].lastElementChild.setAttribute('style', 'min-width: 2em; width: 0');
    }
  };

})();
