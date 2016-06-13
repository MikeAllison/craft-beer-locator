/*************************************************
  Code related to Google Maps Distance Matrix API
**************************************************/

(function() {

  app.controllers = app.controllers || {};

  /**************************************************************************************************************
    reqMultiDistance() - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  ***************************************************************************************************************/
  app.controllers.reqMultiDistance = function(lat, lng, destinations) {
    return new Promise(function(resolve, reject) {
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();
      var maxDests = 25; // Google's limit of destinations for a single Distance Maxtrix request
      var tempDests = null;

      console.log('Total destinations: ' + destinations.length);

      // if (destinations.length > 50) {
      //   tempDests = destinations.splice(0, 25);
      //   params.destinations = [];
      //
      //   var first25 = {
      //     originAddresses: [],
      //     destinationAddresses: [],
      //     rows: [{ elements: [] }]
      //   };
      //
      //   (function(tempDests, first25) {
      //
      //     tempDests.forEach(function(destination) {
      //       params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
      //     });
      //
      //     return service.getDistanceMatrix(params, function(results, status) {
      //       if (status != google.maps.DistanceMatrixStatus.OK) {
      //         reject({ type: 'error', text: 'An error occurred. Please try again.' });
      //         return;
      //       }
      //
      //       first25.originAddresses = results.originAddresses;
      //
      //       results.destinationAddresses.forEach(function(address) {
      //         first25.destinationAddresses.push(address);
      //       });
      //
      //       results.rows[0].elements.forEach(function(element) {
      //         first25.rows[0].elements.push(element);
      //       });
      //
      //       console.dir(first25);
      //     });
      //
      //   })(tempDests, first25);
      // }

      // if (destinations.length > 25) {
      //   tempDests = destinations.splice(0, 25);
      //   params.destinations = [];
      //
      //   var middle25 = {
      //     originAddresses: [],
      //     destinationAddresses: [],
      //     rows: [{ elements: [] }]
      //   };
      //
      //   (function(tempDests, middle25) {
      //
      //     tempDests.forEach(function(destination) {
      //       params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
      //     });
      //
      //     return service.getDistanceMatrix(params, function(results, status) {
      //       if (status != google.maps.DistanceMatrixStatus.OK) {
      //         reject({ type: 'error', text: 'An error occurred. Please try again.' });
      //         return;
      //       }
      //
      //       middle25.originAddresses = results.originAddresses;
      //
      //       results.destinationAddresses.forEach(function(address) {
      //         middle25.destinationAddresses.push(address);
      //       });
      //
      //       results.rows[0].elements.forEach(function(element) {
      //         middle25.rows[0].elements.push(element);
      //       });
      //
      //       console.dir(middle25);
      //     });
      //
      //   })(tempDests, middle25);
      // }

      if (destinations.length <= 25) {
        tempDests = destinations.splice(0, 25);
        params.destinations = [];

        var last25 = {
          originAddresses: [],
          destinationAddresses: [],
          rows: [{ elements: [] }]
        };

        tempDests.forEach(function(destination) {
          params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
        });

        last25.originAddresses = results.originAddresses;

        results.destinationAddresses.forEach(function(address) {
          last25.destinationAddresses.push(address);
        });

        results.rows[0].elements.forEach(function(element) {
          last25.rows[0].elements.push(element);
        });

      }

      function executeDistanceReq() {
        return service.getDistanceMatrix(params, function(results, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }
        });
      }

      function resolveResults() {
        if (allResults.rows[0].elements.length === destinations.length) {
          resolve(allResults);
        }
      }
    });
  };

  /************************************************************************************************************
    reqDrivingDistance() - Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
  *************************************************************************************************************/
  app.controllers.reqDrivingDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };

      // Request the distance & pass to callback
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        var distance, duration;
        // Guard against no transit option to destination
        if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
          distance = results.rows[0].elements[0].distance.text;
          duration = results.rows[0].elements[0].duration.text;
        }
        // Save distance and duration info
        app.models.selectedPlace.setDrivingInfo(distance, duration);
        resolve();
      }
    });
  };

  /***********************************************************************************************************
    reqTransitDistance() - Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
  ************************************************************************************************************/
  app.controllers.reqTransitDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng)],
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: { modes: [google.maps.TransitMode.SUBWAY] },
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };

      // Request the distance & pass to callback
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        var distance, duration;
        // Guard against no transit option to destination
        if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
          distance = results.rows[0].elements[0].distance.text;
          duration = results.rows[0].elements[0].duration.text;
        }
        // Save distance and duration info
        app.models.selectedPlace.setTransitInfo(distance, duration);
        resolve();
      }
    });
  };

})();
