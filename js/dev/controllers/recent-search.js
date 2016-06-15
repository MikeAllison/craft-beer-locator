/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    app.models.userLoc.init();

    app.controllers.setSearchLocation(location);

    app.controllers.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng)
      .then(function(results) {
        app.models.places.add(results);

        var places = app.models.places.get();

        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        places.forEach(function(place){
          var latLng = { lat: null, lng: null };
          latLng.lat = place.geometry.location.lat;
          latLng.lng = place.geometry.location.lng;
          placesCoords.push(latLng);
        });

        return app.controllers.reqMultiDistance(app.models.searchLoc.lat, app.models.searchLoc.lng, placesCoords);
      })
      .then(function(results) {
        var places = app.models.places.get();

        results.rows[0].elements.forEach(function(element, i) {
          if (element.distance) {
            places[i].drivingInfo = {
              value: element.distance.value,
              distance: element.distance.text,
              duration: element.duration.text
            };
          }
        });

        var sortedResults = app.controllers.sortPlaces(places);
        app.models.searchLoc.totalItems = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.places.add(sortedResults);
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
