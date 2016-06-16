/********************************************************************
  formSearch() - Controls the flow of a search initiated by the form
*********************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.formSearch = function() {
    app.models.userLoc.init();

    var tboxVal = app.views.form.cityStateTbox.value;
    if (!tboxVal) {
      app.views.alerts.show('error', 'Please enter a location.');
      app.views.page.enableButtons();
      return;
    }

    app.modules.getGeocode(tboxVal)
      .then(function(response) {
        app.models.searchLoc.lat = response.results[0].geometry.location.lat;
        app.models.searchLoc.lng = response.results[0].geometry.location.lng;
        app.models.searchLoc.setFormattedAddress(response.results[0].formatted_address);

        return app.modules.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng);
      })
      .then(function(results) {
        app.models.places.add(results);

        var places = app.models.places.get();

        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        places.forEach(function(place) {
          var latLng = { lat: null, lng: null };
          latLng.lat = place.geometry.location.lat;
          latLng.lng = place.geometry.location.lng;
          placesCoords.push(latLng);
        });

        return app.modules.reqMultiDistance(app.models.searchLoc.lat, app.models.searchLoc.lng, placesCoords);
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

        var sortedResults = app.modules.sortPlaces(places);

        app.models.searchLoc.totalItems = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.places.add(sortedResults);
        app.models.recentSearches.add();

        app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
        app.views.form.setTboxPlaceholder();
        app.views.results.render();
        app.views.recentSearches.render();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();
