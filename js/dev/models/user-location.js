/*********************
  User Location Model
**********************/

(function() {

  app.models = app.models || {};

  app.models.userLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setLat: function(lat) {
      this.lat = lat;
    },
    setLng: function(lng) {
      this.lng = lng;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    }
  };

})();
