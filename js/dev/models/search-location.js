/***********************
  Search Location Model
************************/

(function() {

  app.models = app.models || {};

  app.models.searchLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.city = null;
      this.state = null;
      this.totalItems = null;
    },
    setBasicDetails: function(location) {
      this.lat = location.lat;
      this.lng = location.lng;
      this.city = location.city;
      this.state = location.state;
      this.totalItems = location.totalItems;
    },
    cityState: function() {
      if (this.city === null || this.state === null) {
        return undefined;
      }
      return this.city + ', ' + this.state;
    }
  };

})();
