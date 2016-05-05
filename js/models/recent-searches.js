var app = app || {};

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
      newLocation.lat = app.models.userLocation.lat || app.models.searchLocation.lat;
      newLocation.lng = app.models.userLocation.lng || app.models.searchLocation.lng;
      newLocation.formattedAddress = app.models.userLocation.formattedAddress || app.models.searchLocation.formattedAddress;
      newLocation.totalItems = app.models.userLocation.totalItems || app.models.searchLocation.totalItems;
      cachedSearches.unshift(newLocation);

      localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
    },
    get: function() {
      return JSON.parse(localStorage.getItem('recentSearches'));
    }
  };

})();
