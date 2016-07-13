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
      var places = this.get(),
          primaryPlaces = places.primary,
          secondaryPlaces = places.secondary;

      for (var i = 0, priLength = primaryPlaces.length; i < priLength; i++) {
        if (primaryPlaces[i].place_id === requestedPlace.place_id) {
          return primaryPlaces[i];
        }
      }

      for (var j = 0, secLength = secondaryPlaces.length; j < secLength; j++) {
        if (secondaryPlaces[j].place_id === requestedPlace.place_id) {
          return secondaryPlaces[j];
        }
      }
    }
  };

})();
