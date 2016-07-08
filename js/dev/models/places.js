/**************
  Places Model
***************/

(function() {

  app.models = app.models || {};

  app.models.places = {
    init: function() {
      sessionStorage.removeItem('places');
    },
    // Adds an array of results of search to sessionStorage
    add: function(places) {
      sessionStorage.setItem('places', JSON.stringify(places));
    },
    // Retrieves an array of results of search from sessionStorage
    get: function() {
      return JSON.parse(sessionStorage.getItem('places'));
    },
    find: function(requestedPlace) {
      var places = this.get();

      for (var i=0; i < places.primary.length; i++) {
        if (places.primary[i].place_id === requestedPlace.place_id) {
          return places.primary[i];
        }
      }

      for (var j=0; j < places.secondary.length; j++) {
        if (places.secondary[j].place_id === requestedPlace.place_id) {
          return places.secondary[j];
        }
      }
    }
  };

})();
