/*********************************************
  Code related to Google Maps Places Library
**********************************************/

(function() {

  app.modules = app.modules || {};

  /********************************************************
    reqPlaces() - Sends a lat/lng to Google Places Library
  *********************************************************/
  app.modules.reqPlaces = function(lat, lng) {
    return new Promise(function(resolve, reject) {
      // Google map isn't shown on page but is required for PlacesService constructor
      var service = new google.maps.places.PlacesService(app.views.map),
          params = {
            location: new google.maps.LatLng(lat, lng),
            rankBy: app.config.settings.search.rankBy,
            keyword: app.config.settings.search.itemType
          },
          places = [];

      // Radius is required on request if ranked by PROMINENCE
      if (params.rankBy === google.maps.places.RankBy.PROMINENCE) {
        params.radius = app.config.settings.search.radius;
      }

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
  app.modules.reqPlaceDetails = function(placeId) {
    return new Promise(function(resolve, reject) {
      var service = new google.maps.places.PlacesService(app.views.map),
          params = { placeId: placeId };

      service.getDetails(params, callback);

      function callback(results, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        resolve(results);
      }
    });
  };

})();
