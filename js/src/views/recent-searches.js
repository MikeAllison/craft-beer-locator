/***********************************
  Code for the Recent Searches list
************************************/

(function() {

  app.views = app.views || {};

  // Recent searches list
  app.views.recentSearches = {
    init: function() {
      // Collect DOM elements
      this.recentSearchesList = document.getElementById('recentSearchesList');
    },
    render: function(recentSearches) {
      this.recentSearchesList.textContent = null;

      if (!recentSearches) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.classList.add('text-center');
        li.textContent = 'You have no recent searches.';
        this.recentSearchesList.appendChild(li);
        return;
      }

      var recentSearchesFragment = document.createDocumentFragment();

      for (var i = 0, length = recentSearches.length; i < length; i++) {
        var li = document.createElement('li'),
            span = document.createElement('span');

        li.classList.add('list-group-item');
        li.textContent = recentSearches[i].city + ', ' + recentSearches[i].state;

        span.classList.add('badge');
        span.textContent = recentSearches[i].totalItems;

        li.appendChild(span);

        li.addEventListener('click', (function(location) {
          return function() {
            app.views.page.disableButtons();
            app.views.page.clear();
            $('#resultsTab').tab('show');
            app.controllers.recentSearch(location);
          };
        })(recentSearches[i]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        recentSearchesFragment.appendChild(li);
      }

      this.recentSearchesList.appendChild(recentSearchesFragment);
    }
  };

})();
