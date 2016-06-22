/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    app.views.progressModal.start('Requesting Places');

    app.models.searchLoc.isGeoSearch = false;
    app.models.searchLoc.setBasicDetails(location);

    app.modules.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng)
      .then(function(results) {
        app.views.progressModal.update(33, 'Requesting Distances');

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

        return app.modules.reqMultiDistance(app.models.searchLoc.lat, app.models.searchLoc.lng, placesCoords);
      })
      .then(function(results) {
        app.views.progressModal.update(66, 'Sorting Places');

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

        var sortedPlaces = app.modules.sortPlaces(places);

        app.models.places.add(sortedPlaces);
        app.models.searchLoc.totalItems = sortedPlaces.primary.length + sortedPlaces.secondary.length;

        app.views.progressModal.update(99, 'Preparing Results');

        // Smooth the display of results
        window.setTimeout(function() {
          var cityState = app.models.searchLoc.cityState();

          app.views.form.setTboxPlaceholder(cityState);
          app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
          app.views.results.render(sortedPlaces);
          app.views.page.enableButtons();
        }, 999);
      })
      .catch(app.controllers.stopExecution);
  };

})();
