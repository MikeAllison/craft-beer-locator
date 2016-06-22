/***********************
  Recent Searches Model
************************/

(function() {

  app.models = app.models || {};

  app.models.recentSearches = {
    add: function(searchLoc) {
      var cachedSearches = this.get();

      if (!cachedSearches) {
        cachedSearches = [];
      } else if (cachedSearches.length >= 5) {
        cachedSearches.pop();
      }

      var newLocation = {};
      newLocation.lat = searchLoc.lat;
      newLocation.lng = searchLoc.lng;
      newLocation.city = searchLoc.city;
      newLocation.state = searchLoc.state;
      newLocation.totalItems = searchLoc.totalItems;
      cachedSearches.unshift(newLocation);

      localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
    },
    get: function() {
      return JSON.parse(localStorage.getItem('recentSearches'));
    }
  };

})();
