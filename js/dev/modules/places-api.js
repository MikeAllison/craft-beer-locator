// Code related to Google Maps Places Library

(function() {

  app.controllers = app.controllers || {};

  // reqPlaces - Sends a lat/lng to Google Places Library and stores results
  app.controllers.reqPlaces = function() {
    return new Promise(function(resolve, reject) {
      // Reset so that search location is added to Recent Searches
      app.controllers.newSearch = true;
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      var location = new google.maps.LatLng(lat, lng);
      var params = {
        location: location,
        rankBy: app.config.settings.search.rankBy,
        keyword: app.config.settings.search.itemType
      };

      // Radius is required on request if ranked by PROMINENCE
      if (params.rankBy === google.maps.places.RankBy.PROMINENCE) {
        params.radius = app.config.settings.search.radius;
      }

      // Google map isn't shown on page but is required for PlacesService constructor
      var service = new google.maps.places.PlacesService(app.views.map.map);
      service.nearbySearch(params, callback);

      function callback(results, status, pagination) {
        if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          reject({ type: 'info', text: 'Your request returned no results.' });
          return;
        }

        if (status != google.maps.places.PlacesServiceStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        // Add results to sessionStorage
        app.models.places.add(results);
        // Store pagination object for more results
        app.models.places.paginationObj = pagination;
        resolve();
      }
    });
  };

  // reqPlaceDetails - This requests details of the selectedPlace from Google
  app.controllers.reqPlaceDetails = function() {
    return new Promise(function(resolve, reject) {
      var params = { placeId: app.models.selectedPlace.placeId };

      service = new google.maps.places.PlacesService(app.views.map.map);
      service.getDetails(params, callback);

      function callback(results, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        app.models.selectedPlace.setWebsite(results.website);
        app.models.selectedPlace.setAddress(results.formatted_address);
        app.models.selectedPlace.setGoogleMapsUrl(results.url);
        app.models.selectedPlace.setPhoneNum(results.formatted_phone_number);
        // This is needed to guard against items without opening_hours
        if (results.opening_hours) {
          app.models.selectedPlace.setOpenNow(results.opening_hours.open_now);
          app.models.selectedPlace.setHoursOpen(results.opening_hours.weekday_text);
        }
        resolve();
      }
    });
  };

})();
