var app = app || {};

(function() {

  app.views = app.views || {};

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
        app.controller.requestMoreResults();
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
