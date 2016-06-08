/********************************************************************
  formSearch() - Controls the flow of a search initiated by the form
*********************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.formSearch = function() {
    this.newSearch = true;

    app.controllers.getGeocode()
      .then(app.controllers.reqPlaces)
      .then(function() {
        var places = app.models.places.get();

        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }

        return app.controllers.reqMultiDistance(app.models.searchLoc.lat, app.models.searchLoc.lng, placesCoords);
      })
      .then(function(results) {
        var places = app.models.places.get();

        for (var i=0; i < results.rows[0].elements.length; i++) {
          if (results.rows[0].elements[i].distance) {
          // Add distance info to each result (value is distance in meters which is needed for sorting)
            places[i].drivingInfo = {
              value: results.rows[0].elements[i].distance.value,
              distance: results.rows[0].elements[i].distance.text,
              duration: results.rows[0].elements[i].duration.text
            };
          }
        }

        var sortedResults = app.controllers.sortPlaces(places);
        var totalResults = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.searchLoc.setTotalItems(app.models.places.paginationObj.hasNextPage ? totalResults + '+' : totalResults);
        app.models.places.add(sortedResults);
        app.controllers.addRecentSearch();
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
