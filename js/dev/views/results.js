/***************************
  Code for the results list
****************************/

(function() {

  app.views = app.views || {};

  // Results list
  app.views.results = {
    init: function() {
      // Collect DOM elements
      this.primaryResults = document.getElementById('primaryResults');
      this.primaryResultsList = document.getElementById('primaryResultsList');
      this.secondaryResults = document.getElementById('secondaryResults');
      this.secondaryResultsList = document.getElementById('secondaryResultsList');
      // Set default values
      this.primaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
    },
    clear: function() {
      this.secondaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
      this.primaryResultsList.textContent = null;
      this.secondaryResultsList.textContent = null;
    },
    render: function(places) {
      this.primaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
      this.primaryResultsList.textContent = null;
      this.secondaryResultsList.textContent = null;

      if (!places) {
        app.views.alerts.show('info', 'Your request returned no results.');
        return;
      }

      // Add primary results to DOM
      for (var i=0; i < places.primary.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places.primary[i].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places.primary[i].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places.primary[i]));

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

        this.primaryResultsList.appendChild(li);
      }

      // Add secondary results to DOM
      for (var j=0; j < places.secondary.length; j++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places.secondary[j].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places.secondary[j].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places.secondary[j]));

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

        this.secondaryResultsList.appendChild(li);
      }

      if (places.primary.length > 0) {
        this.primaryResults.classList.remove('hidden');
      }

      if (places.secondary.length > 0) {
        this.secondaryResults.classList.remove('hidden');
      }
      // Select results tab and panel to show new results
      $('#resultsTab').tab('show');
    }
  };

})();
