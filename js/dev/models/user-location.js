/*********************
  User Location Model
**********************/

(function() {

  app.models = app.models || {};

  app.models.userLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.city = null;
      this.state = null;
      this.totalItems = null;
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    },
    cityState: function() {
      if (this.city === null || this.state === null) {
        return undefined;
      }
      return this.city + ', ' + this.state;
    }
  };

})();
