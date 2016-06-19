/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    app.views.progressModal.start('Getting Location');

    app.models.searchLoc.isGeoSearch = true;

    app.modules.getCurrentLocation()
      .then(function(position) {
        app.views.progressModal.update(20, 'Getting Location');

        app.models.searchLoc.lat = position.coords.latitude;
        app.models.searchLoc.lng = position.coords.longitude;

        return app.modules.reverseGeocode(app.models.searchLoc.lat, app.models.searchLoc.lng);
      })
      .then(function(response) {
        app.views.progressModal.update(40, 'Requesting Places');

        app.models.searchLoc.city = response.results[0].address_components[2].long_name;
        app.models.searchLoc.state = response.results[0].address_components[4].short_name;

        return app.modules.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng);
      })
      .then(function(results) {
        app.views.progressModal.update(60, 'Requesting Distances');
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
        app.views.progressModal.update(80, 'Sorting Places');
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

        app.views.progressModal.update(99, 'Preparing Results');

        // Smooth the display of results
        window.setTimeout(function() {
          app.views.form.setTboxPlaceholder();
          app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
          app.views.results.render();
          app.views.recentSearches.render();
          app.views.page.enableButtons();
        }, 999);
      })
      .catch(app.controllers.stopExecution);
  };

})();
