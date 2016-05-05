// Code related to the form and searching with the app

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

  // Location button
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

  // More results button if > 20 results are returned from the search
  app.views.moreResultsBtn = {
    init: function() {
      // Collect DOM elements
      this.moreResultsBtn = document.getElementById('moreResultsBtn');
      // Set default values on DOM elements
      this.moreResultsBtn.classList.add('hidden');
      // Add click handlers
      this.moreResultsBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        window.scroll(0, 0);
      });
    },
    addNextPageFn: function() {
      this.moreResultsBtn.onclick = function() {
        app.controllers.requestMoreResults();
      };
    },
    show: function() {
      this.moreResultsBtn.classList.remove('hidden');
      // Google Places search requires 2 seconds between searches
      window.setTimeout(function() {
        moreResultsBtn.removeAttribute('disabled');
      }, 2000);
    },
    disable: function() {
      this.moreResultsBtn.setAttribute('disabled', true);
    },
    hide: function() {
      this.moreResultsBtn.classList.add('hidden');
    }
  };

})();
