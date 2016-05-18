var app = app || {};

(function() {

  app.views = app.views || {};

  // Recent searches list
  app.views.recentSearches = {
    init: function() {
      // Collect DOM elements
      this.recentSearchesList = document.getElementById('recentSearchesList');
      this.render();
    },
    render: function() {
      this.recentSearchesList.textContent = null;
      var recentSearches = app.models.recentSearches.get();

      if (!recentSearches) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.classList.add('text-center');
        li.textContent = 'You have no recent searches.';
        this.recentSearchesList.appendChild(li);
        return;
      }

      for (var i=0; i < recentSearches.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = recentSearches[i].formattedAddress;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = recentSearches[i].totalItems;

        li.appendChild(span);

        li.addEventListener('click', (function(location) {
          return function() {
            app.views.page.disableButtons();
            app.views.page.clear();
            app.controllers.recentSearch(location);
          };
        })(recentSearches[i]));

        (function(li) {
            li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
          });
        })(li);

        (function(li) {
            li.addEventListener('touchstart', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('touchend', function() {
            li.classList.remove('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('hovered');
          });
        })(li);

        this.recentSearchesList.appendChild(li);
      }
    }
  };

})();
