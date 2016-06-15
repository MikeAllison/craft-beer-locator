/***********************
  Search Location Model
************************/

(function() {

  app.models = app.models || {};

  app.models.searchLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    }
  };

})();
