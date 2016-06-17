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

    app.views.resultsProgressSection.start('Getting Location');

    app.models.searchLoc.isGeoSearch = false;

    app.modules.getGeocode(tboxVal)
      .then(function(response) {
        app.views.resultsProgressSection.update(25, 'Requesting Places');

        app.models.searchLoc.lat = response.results[0].geometry.location.lat;
        app.models.searchLoc.lng = response.results[0].geometry.location.lng;

        var address = response.results[0].formatted_address.replace(/((\s\d+)?,\sUSA)/i, '');
        address = address.split(/,\s/);
        app.models.searchLoc.city = address.shift();
        app.models.searchLoc.state = address.pop();

        return app.modules.reqPlaces(app.models.searchLoc.lat, app.models.searchLoc.lng);
      })
      .then(function(results) {
        app.views.resultsProgressSection.update(50, 'Requesting Distances');

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
        app.views.resultsProgressSection.update(75, 'Sorting Places');

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

        app.views.resultsProgressSection.update(98, 'Preparing Results');

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
