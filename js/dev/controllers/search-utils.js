(function() {

  app.controllers = app.controllers || {};

  app.controllers.stopExecution = function(msg) {
    $('#progressModal').modal('hide');
    $('#progressModal').on('hidden.bs.modal', function() {
      app.views.progressModal.init();
    });
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
    app.models.selectedPlace.init();

    var lat = app.models.searchLoc.lat;
    var lng = app.models.searchLoc.lng;
    var requestedPlace = app.models.places.find(place);

    app.models.selectedPlace.setBasicDetails(requestedPlace);
    app.models.selectedPlace.setDrivingInfo(requestedPlace.drivingInfo.distance, requestedPlace.drivingInfo.duration);

    app.modules.reqPlaceDetails(requestedPlace.place_id)
      .then(function(results) {
        app.models.selectedPlace.setSpecificDetails(results);

        var origin = { lat: app.models.searchLoc.lat, lng: app.models.searchLoc.lng };
        var destination = { lat: app.models.selectedPlace.lat, lng: app.models.selectedPlace.lng };

        return app.modules.reqTransitDistance(origin, destination);
      })
      .then(function(results) {
        var distance, duration;
        // Guard against no transit option to destination
        if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
          distance = results.rows[0].elements[0].distance.text;
          duration = results.rows[0].elements[0].duration.text;
        }
        // Save distance and duration info
        app.models.selectedPlace.setTransitInfo(distance, duration);

        app.views.placeModal.populate(app.models.selectedPlace);
        app.views.placeModal.show();
      })
      .catch(app.controllers.stopExecution);
  };

  /*****************************************************************************************************
    switchToGeolocation() - Requests distance from your location to a place (triggered from placeModal)
  ******************************************************************************************************/
  app.controllers.switchToGeolocation = function() {
    app.models.searchLoc.isGeoSearch = true;

    app.modules.getCurrentLocation()
      .then(function(position) {
        app.models.searchLoc.lat = position.coords.latitude;
        app.models.searchLoc.lng = position.coords.longitude;

        var origin = {
          lat: app.models.searchLoc.lat,
          lng: app.models.searchLoc.lng
        };

        var destination = {
          lat: app.models.selectedPlace.lat,
          lng: app.models.selectedPlace.lng
        };

        return app.modules.reqDrivingDistance(origin, destination);
      })
      .then(function(results) {
        var distance, duration;
        // Guard against no transit option to destination
        if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
          distance = results.rows[0].elements[0].distance.text;
          duration = results.rows[0].elements[0].duration.text;
        }
        // Save distance and duration info
        app.models.selectedPlace.setDrivingInfo(distance, duration);

        var origin = {
          lat: app.models.searchLoc.lat,
          lng: app.models.searchLoc.lng
        };

        var destination = {
          lat: app.models.selectedPlace.lat,
          lng: app.models.selectedPlace.lng
        };

        return app.modules.reqTransitDistance(origin, destination);
      })
      .then(function(results) {
        var distance, duration;
        // Guard against no transit option to destination
        if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
          distance = results.rows[0].elements[0].distance.text;
          duration = results.rows[0].elements[0].duration.text;
        }
        // Save distance and duration info
        app.models.selectedPlace.setTransitInfo(distance, duration);

        app.views.placeModal.populate();
        app.views.placeModal.show();

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

        return app.modules.reqMultiDistance(app.models.searchLoc.lat, app.models.searchLoc.lng, placesCoords);
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

        var sortedPlaces = app.modules.sortPlaces(places);

        app.models.places.add(sortedPlaces);
        app.models.searchLoc.totalItems = sortedPlaces.primary.length + sortedPlaces.secondary.length;

        app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
        app.views.results.render(sortedPlaces);
        app.views.placeModal.init();
      })
      .catch(app.controllers.stopExecution);
  };

})();
