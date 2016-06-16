/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    app.models.searchLoc.init();

    app.modules.getCurrentLocation()
      .then(function(position) {
        app.models.userLoc.lat = position.coords.latitude;
        app.models.userLoc.lng = position.coords.longitude;

        return app.modules.reverseGeocode(app.models.userLoc.lat, app.models.userLoc.lng);
      })
      .then(function(response) {
        var formattedAddress = response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name;
        // Sets .formattedAddress as city, state (i.e. New York, NY)
        app.models.userLoc.setFormattedAddress(formattedAddress);

        return app.modules.reqPlaces(app.models.userLoc.lat, app.models.userLoc.lng);
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

        return app.modules.reqMultiDistance(app.models.userLoc.lat, app.models.userLoc.lng, placesCoords);
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
