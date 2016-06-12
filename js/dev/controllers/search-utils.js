(function() {

  app.controllers = app.controllers || {};

  app.controllers.stopExecution = function(msg) {
    app.views.alerts.show(msg.type, msg.text);
    app.views.results.clear();
    app.views.placeModal.hide();
    app.views.page.enableButtons();
    return;
  };

  /******************************************************************************************
    getDetails() - Controls the flow for acquiring details when a specific place is selected
  *******************************************************************************************/
  app.controllers.getDetails = function(place) {
    var requestedPlace = app.models.places.find(place);

    app.controllers.setSelectedPlaceDetails(requestedPlace)
      .then(app.controllers.reqPlaceDetails)
      .then(app.controllers.reqTransitDistance)
      .then(app.controllers.updateModal)
      .catch(app.controllers.stopExecution);
  };

  /*****************************************************************************************************
    switchToGeolocation() - Requests distance from your location to a place (triggered from placeModal)
  ******************************************************************************************************/
  app.controllers.switchToGeolocation = function() {
    app.controllers.getCurrentLocation()
      .then(function(position) {
        app.models.userLoc.lat = position.coords.latitude;
        app.models.userLoc.lng = position.coords.longitude;
      })
      .then(app.controllers.reqDrivingDistance)
      .then(app.controllers.reqTransitDistance)
      .then(app.controllers.updateModal)
      .then(function() {
        var places = app.models.places.get();
        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }
        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        places.forEach(function(place) {
          var latLng = { lat: null, lng: null };
          latLng.lat = place.geometry.location.lat;
          latLng.lng = place.geometry.location.lng;
          placesCoords.push(latLng);
        });

        return app.controllers.reqMultiDistance(app.models.userLoc.lat, app.models.userLoc.lng, placesCoords);
      })
      .then(function(results) {
        var places = app.models.places.get();

        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }

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
        var totalResults = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.searchLoc.setTotalItems(app.models.places.paginationObj.hasNextPage ? totalResults + '+' : totalResults);
        app.models.places.add(sortedResults);
        app.controllers.updatePage();
      })
      .catch(app.controllers.stopExecution);
  };

  /***************************************************************************
    requestMoreResults() - Requests more results if > 20 results are returned
  ****************************************************************************/
  app.controllers.requestMoreResults = function() {
    var paginationObj = app.models.places.paginationObj;
    paginationObj.nextPage();

    // Need to wait for AJAX request to finish before moving on and can't use JS promise
    window.setTimeout(function() {
      var lat = app.models.userLoc.lat || app.models.userLoc.lat;
      var lng = app.models.userLoc.lng || app.models.userLoc.lng;

      // STUCK HERE:  getPlaces doesn't return anything unless it's a Promise
      // var places below is the 1st results of places
      // May need to move the addition of places out of searches and back into getPlaces
      var places = app.models.places.get();

      // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
      var placesCoords = [];
      for (var i=0; i < places.length; i++) {
        var latLng = { lat: null, lng: null };
        latLng.lat = places[i].geometry.location.lat;
        latLng.lng = places[i].geometry.location.lng;
        placesCoords.push(latLng);
      }

      app.controllers.reqMultiDistance(lat, lng, placesCoords)
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
    }, 2000);
  };

})();
