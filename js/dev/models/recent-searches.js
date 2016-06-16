/***********************
  Recent Searches Model
************************/

(function() {

  app.models = app.models || {};

  app.models.recentSearches = {
    add: function() {
      var cachedSearches = this.get();

      if (!cachedSearches) {
        cachedSearches = [];
      } else if (cachedSearches.length >= 5) {
        cachedSearches.pop();
      }

      var newLocation = {};
      newLocation.lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      newLocation.lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      newLocation.city = app.models.userLoc.city || app.models.searchLoc.city;
      newLocation.state = app.models.userLoc.state || app.models.searchLoc.state;
      newLocation.totalItems = app.models.userLoc.totalItems || app.models.searchLoc.totalItems;
      cachedSearches.unshift(newLocation);

      localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
    },
    get: function() {
      return JSON.parse(localStorage.getItem('recentSearches'));
    }
  };

})();
