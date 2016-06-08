/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    this.newSearch = true;
    app.models.searchLoc.init();

    app.controllers.getCurrentLocation()
      .then(function(position) {
        app.models.userLoc.lat = position.coords.latitude;
        app.models.userLoc.lng = position.coords.longitude;

        return app.controllers.reverseGeocode(app.models.userLoc.lat, app.models.userLoc.lng);
      })
      .then(function(response) {
        var formattedAddress = response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name;
        // Sets .formattedAddress as city, state (i.e. New York, NY)
        app.models.userLoc.setFormattedAddress(formattedAddress);

        return app.controllers.reqPlaces(app.models.userLoc.lat, app.models.userLoc.lng);
      })
      .then(function(results) {
        app.models.places.add(results);

        var places = app.models.places.get();

        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }

        return app.controllers.reqMultiDistance(app.models.userLoc.lat, app.models.userLoc.lng, placesCoords);
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
