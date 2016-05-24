// Places model

(function() {

  app.models = app.models || {};

  app.models.places = {
    init: function() {
      sessionStorage.clear();
      this.paginationObj = {};
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

      for (var i=0; i < places.length; i++) {
        if (places[i].place_id === requestedPlace.place_id) {
          return places[i];
        }
      }
    },
    setPaginationObj: function(paginationObj) {
      this.paginationObj = paginationObj;
    }
  };

})();
