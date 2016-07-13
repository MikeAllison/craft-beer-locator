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

        var places = app.models.places.get(),
            placesCoords = [];

        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        places.forEach(function(place) {
          placesCoords.push({ lat: place.geometry.location.lat, lng: place.geometry.location.lng });
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

        var sortedPlaces = app.modules.sortPlaces(places);

        app.models.places.add(sortedPlaces);
        app.models.searchLoc.totalItems = sortedPlaces.primary.length + sortedPlaces.secondary.length;
        app.models.recentSearches.add(app.models.searchLoc);

        app.views.progressModal.update(99, 'Preparing Results');

        // Smooth the display of results
        window.setTimeout(function() {
          var cityState = app.models.searchLoc.cityState(),
              recentSearches = app.models.recentSearches.get();

          app.views.form.setTboxPlaceholder(cityState);
          app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
          app.views.results.render(sortedPlaces);
          app.views.recentSearches.render(recentSearches);
          app.views.page.enableButtons();
        }, 999);
      })
      .catch(app.controllers.stopExecution);
  };

})();
