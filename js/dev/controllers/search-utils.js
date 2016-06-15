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
    app.models.selectedPlace.init();
    // Set params for search (use userLoc if available)
    var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
    var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
    var selectedPlace = app.models.places.find(place);

    app.models.selectedPlace.placeId = selectedPlace.place_id;
    app.models.selectedPlace.lat = selectedPlace.geometry.location.lat;
    app.models.selectedPlace.lng = selectedPlace.geometry.location.lng;
    app.models.selectedPlace.name = selectedPlace.name;
    app.models.selectedPlace.setDrivingInfo(selectedPlace.drivingInfo.distance, selectedPlace.drivingInfo.duration);

    app.modules.reqPlaceDetails(selectedPlace.place_id)
      .then(function(results) {
        app.models.selectedPlace.setWebsite(results.website);
        app.models.selectedPlace.setAddress(results.formatted_address);
        app.models.selectedPlace.setGoogleMapsUrl(results.url);
        app.models.selectedPlace.setPhoneNum(results.formatted_phone_number);
        // This is needed to guard against items without opening_hours
        if (results.opening_hours) {
          app.models.selectedPlace.setOpenNow(results.opening_hours.open_now);
          app.models.selectedPlace.setHoursOpen(results.opening_hours.weekday_text);
        }
        
        return app.modules.reqTransitDistance();
      })
      .then(function() {
        app.views.placeModal.populate();
        app.views.placeModal.show();
      })
      .catch(app.controllers.stopExecution);
  };

  /*****************************************************************************************************
    switchToGeolocation() - Requests distance from your location to a place (triggered from placeModal)
  ******************************************************************************************************/
  app.controllers.switchToGeolocation = function() {
    app.modules.getCurrentLocation()
      .then(function(position) {
        app.models.userLoc.lat = position.coords.latitude;
        app.models.userLoc.lng = position.coords.longitude;
      })
      .then(app.modules.reqDrivingDistance)
      .then(app.modules.reqTransitDistance)
      .then(function() {
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

        return app.modules.reqMultiDistance(app.models.userLoc.lat, app.models.userLoc.lng, placesCoords);
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

        var sortedResults = app.modules.sortPlaces(places);
        app.models.searchLoc.totalItems = sortedResults.primary.length + sortedResults.secondary.length;
        app.models.places.add(sortedResults);
        app.controllers.updatePage();
      })
      .catch(app.controllers.stopExecution);
  };

})();
