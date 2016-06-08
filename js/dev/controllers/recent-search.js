/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    this.newSearch = true;

    app.models.userLoc.init();
    app.controllers.setSearchLocation(location);

    app.controllers.reqPlaces()
      .then(function() {
        var places = app.models.places.get();
        // TO-DO: Set a console.dir(places) and test (sorting usually happens after this)
        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }
        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }
        // TO-DO: Possibly remove the variables and userLoc below
        var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
        var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
        return app.controllers.reqMultiDistance(lat, lng, placesCoords);
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
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
