/********************************************************************
  formSearch() - Controls the flow of a search initiated by the form
*********************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.formSearch = function() {
    var tboxVal = app.views.form.cityStateTbox.value;
    if (!tboxVal) {
      app.views.alerts.show('error', 'Please enter a location.');
      app.views.page.enableButtons();
      return;
    }

    app.views.progressModal.start('Getting Location');

    app.models.searchLoc.isGeoSearch = false;

    app.modules.getGeocode(tboxVal)
      .then(function(response) {
        app.views.progressModal.update(25, 'Requesting Places');

        app.models.searchLoc.lat = response.results[0].geometry.location.lat;
        app.models.searchLoc.lng = response.results[0].geometry.location.lng;

        var address = response.results[0].formatted_address.replace(/((\s\d+)?,\sUSA)/i, '');
        address = address.split(/,\s/);
        app.models.searchLoc.city = address.shift();
        app.models.searchLoc.state = address.pop();

        return app.modules.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng);
      })
      .then(function(results) {
        app.views.progressModal.update(50, 'Requesting Distances');

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
        app.views.progressModal.update(75, 'Sorting Places');

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
