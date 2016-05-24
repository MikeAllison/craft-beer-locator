var app = app || {};

(function() {

  app.views = app.views || {};

  // Results list
  app.views.results = {
    init: function() {
      // Collect DOM elements
      this.resultsList = document.getElementById('resultsList');
    },
    clear: function() {
      this.resultsList.textContent = null;
      app.views.moreResultsBtn.hide();
      app.views.moreResultsBtn.disable();
    },
    render: function() {
      this.resultsList.textContent = null;
      this.resultsList.classList.remove('hidden');

      var places = app.models.places.get();
      if (!places) {
        app.views.alerts.show('info', 'Your request returned no results.');
        return;
      }

      for (var i=0; i < places.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places[i].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places[i].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places[i]));

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

        this.resultsList.appendChild(li);
      }

      // Select results tab and panel to show new results
      $('#resultsTab').tab('show');
    }
  };

})();
