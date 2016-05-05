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
    },
    render: function() {
      this.resultsList.textContent = null;
      this.resultsList.classList.remove('hidden');

      var results = app.models.places.get();

      if (results) {
        for (var i=0; i < results.length; i++) {
          var li = document.createElement('li');
          li.classList.add('list-group-item');
          li.textContent = results[i].name;

          var span = document.createElement('span');
          span.classList.add('badge');
          span.textContent = results[i].drivingInfo.distance;

          li.appendChild(span);

          li.addEventListener('click', (function(place) {
            return function() {
              app.controllers.getDetails(place);
            };
          })(results[i]));

          this.resultsList.appendChild(li);
        }
      }
      // Select results tab and panel to show new results
      $('#resultsTab').tab('show');
    }
  };

})();
