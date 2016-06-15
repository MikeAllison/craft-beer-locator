/*********************************************
  Code related to Google Maps Places Library
**********************************************/

(function() {

  app.modules = app.modules || {};

  /***************************************************************************
    reqPlaces() - Sends a lat/lng to Google Places Library and stores results
  ****************************************************************************/
  app.modules.reqPlaces = function(lat, lng) {
    return new Promise(function(resolve, reject) {
      var params = {
        location: new google.maps.LatLng(lat, lng),
        rankBy: app.config.settings.search.rankBy,
        keyword: app.config.settings.search.itemType
      };
      var places = [];

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

        places = places.concat(results);

        if (pagination.hasNextPage) {
          pagination.nextPage();
        } else {
          resolve(places);
        }

      }
    });
  };

  /****************************************************************************
    reqPlaceDetails() - This requests details of the selectedPlace from Google
  *****************************************************************************/
  app.modules.reqPlaceDetails = function() {
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
