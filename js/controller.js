var app = app || {};

(function() {

  app.controller = {
    init: function() {
      // Set defaults on variables to control flow of search
      this.newSearch = true;
      // Initialize config, models, & views
      app.config.init();
      app.models.searchLocation.init();
      app.models.places.init();
      app.views.page.init();
      app.views.map.init();
      app.views.form.init();
      app.views.locationBtn.init();
      app.views.alerts.init();
      app.views.results.init();
      app.views.recentSearches.init();
      app.views.itemModal.init();
      app.views.moreResultsBtn.init();
    },
    // Controls the flow of a search initiated by the form
    formSearch: function() {
      app.models.userLocation.init();
      app.controller.getGeocode()
        .then(app.controller.requestPlaces)
        .then(app.controller.sortPlaces)
        .then(app.controller.requestDistance)
        .then(app.controller.updatePage)
        .then(app.views.page.enableButtons);
    },
    // Controls the flow of a search initiated by the 'My Location' button
    geolocationSearch: function() {
      app.models.searchLocation.init();
      app.controller.getCurrentLocation()
        .then(app.controller.reverseGeocode)
        .then(app.controller.requestPlaces)
        .then(app.controller.sortPlaces)
        .then(app.controller.requestDistance)
        .then(app.controller.updatePage)
        .then(app.views.page.enableButtons);
    },
    // Controls the flow of a search initiated by clicking a location in Recent Searches
    recentSearch: function(location) {
      app.models.userLocation.init();
      app.controller.setSearchLocation(location);
      app.controller.requestPlaces()
        .then(app.controller.sortPlaces)
        .then(app.controller.requestDistance)
        .then(app.controller.updatePage)
        .then(app.views.page.enableButtons);
    },
    // Controls the flow for acquiring details when a specific place is selected
    getDetails: function(place) {
      var requestedPlace = app.models.places.find(place);
      app.controller.setSelectedPlaceDetails(requestedPlace)
        .then(app.controller.requestPlaceDetails)
        .then(app.controller.requestDrivingDistance)
        .then(app.controller.requestTransitDistance)
        .then(app.controller.updateModal);
    },
    // Requests distance from your location to a place (triggered from itemModal)
    getMyDistance: function() {
      app.controller.getCurrentLocation()
        .then(app.controller.requestDrivingDistance)
        .then(app.controller.requestTransitDistance)
        .then(app.controller.updateModal);
    },
    requestMoreResults: function() {
      var paginationObj = app.models.places.paginationObj;
      paginationObj.nextPage();
      // TO-DO: Fix this hack
      // Need to wait for AJAX request to finish before moving on and can't use JS promise
      window.setTimeout(function() {
        app.controller.requestDistance()
          .then(app.controller.sortPlaces)
          .then(app.controller.updatePage)
          .then(app.views.page.enableButtons);
      }, 2000);
    },
    // Takes a city, state and converts it to lat/lng using Google Geocoding API
    // This could be performed using a Google Maps object but I wanted to practice using AJAX requests
    getGeocode: function() {
      return new Promise(function(resolve, reject) {
        var tboxVal = app.views.form.cityStateTbox.value;

        if (!tboxVal) {
          app.views.alerts.error('Please enter a location.');
          app.views.page.enableButtons();
          return;
        }

        // AJAX request for lat/lng for form submission
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          app.views.alerts.error('Sorry, please try again.');
          app.views.page.enableButtons();
          return;
        }

        var params = 'key=' + app.config.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
        httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status !== 200) {
              app.views.alerts.error('Sorry, please try again.');
              app.views.page.enableButtons();
              return;
            } else {
              var response = JSON.parse(httpRequest.responseText);

              if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
                app.views.alerts.error('Sorry, that location could not be found.');
                app.views.page.enableButtons();
                return;
              } else {
                app.models.searchLocation.setLat(response.results[0].geometry.location.lat);
                app.models.searchLocation.setLng(response.results[0].geometry.location.lng);
                app.models.searchLocation.setFormattedAddress(response.results[0].formatted_address);
              }
            }
            resolve();
          }
        };

        httpRequest.send();
      });
    },
    // HTML5 geocoding request for lat/lng for 'My Location' button
    getCurrentLocation: function() {
      return new Promise(function(resolve, reject) {
        var success = function(position) {
          app.models.userLocation.setLat(position.coords.latitude);
          app.models.userLocation.setLng(position.coords.longitude);
          resolve();
        };
        var error = function() {
          app.views.alerts.error('Sorry, please try again.');
        };
        var options = { enableHighAccuracy: true };

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(success, error, options);
        } else {
          app.views.alerts.error('Sorry, geolocation is not supported in your browser.');
        }
      });
    },
    // Converts lat/lng to a city, state
    reverseGeocode: function() {
      return new Promise(function(resolve, reject) {
        var httpRequest = new XMLHttpRequest();
        var params = 'key=' + app.config.google.apiKey + '&latlng=' + app.models.userLocation.lat + ',' + app.models.userLocation.lng;

        httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);
        httpRequest.send();

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            var response = JSON.parse(httpRequest.responseText);
            var formattedAddress = response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name;
            // Sets .formattedAddress as city, state (i.e. New York, NY)
            app.models.userLocation.setFormattedAddress(formattedAddress);
          }
          resolve();
        };
      });
    },
    // Sends a lat/lng to Google Places Library and stores results
    requestPlaces: function() {
      return new Promise(function(resolve, reject) {
        // Reset so that search location is added to Recent Searches
        app.controller.newSearch = true;
        // Set params for search (use userLocation if available)
        var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
        var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
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
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            // Add results to sessionStorage
            app.models.places.add(results);
            // Store pagination object for more results
            app.models.places.setPaginationObj(pagination);
          } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            app.models.places.init();
            app.views.alerts.info('Your request returned no results.');
            app.views.results.render();
            app.views.page.enableButtons();
          } else {
            app.models.places.init();
            app.views.alerts.error('Sorry, please try again.');
            app.views.results.render();
            app.views.page.enableButtons();
          }
          resolve();
        }
      });
    },
    // Requests distance (driving) from Google Maps Distance Matrix for a collection of places
    requestDistance: function() {
      return new Promise(function(resolve, reject) {
        // Set params for search (use userLocation if available)
        var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
        var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
        var origin = new google.maps.LatLng(lat, lng);
        var places = app.models.places.get();
        var placesWithDistance = [];

        var service = new google.maps.DistanceMatrixService();

        if (places) {
          for (var i=0; i < places.length; i++) {
            // params must be reset before each request
            var params = {
              origins: [origin],
              destinations: [],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.IMPERIAL
            };

            // Closure needed for AJAX to assign response to correct places object
            (function(place) {
              // Set the destination
              var destination = new google.maps.LatLng(places[i].geometry.location.lat, places[i].geometry.location.lng);
              params.destinations.push(destination);

              // Request the distance & pass to callback
              // Passing an anonymous function to .getDistanceMatrix() prevents recreating the callback function on every result iteration
              service.getDistanceMatrix(params, function(results, status) { callback(results, status, place); });
            })(places[i]);
          }
        }

        function callback(results, status, place) {
          if (status == google.maps.DistanceMatrixStatus.OK) {
            // Guard against no driving options to destination
            if (results.rows[0].elements[0].distance) {
              // Add distance info to each result
              place.drivingInfo = {
                distance: results.rows[0].elements[0].distance.text
              };
            }
            placesWithDistance.push(place);
            if (placesWithDistance.length === places.length) {
              app.models.places.add(placesWithDistance);
              resolve();
            }
          }
        }
      });
    },
    // Handles processing of places returned from Google.
    sortPlaces: function() {
      return new Promise(function(resolve, reject) {
        var primaryTypes = app.config.settings.search.primaryTypes;
        var secondaryTypes = app.config.settings.search.secondaryTypes;
        var excludedTypes = app.config.settings.search.excludedTypes;
        var primaryResults = [];
        var secondaryResults = [];
        var sortedResults = [];
        var places = app.models.places.get();

        // Sorts results based on relevent/exlcuded categories in app.config.settings.search
        for (var i=0; i < places.length; i++) {
          var hasPrimaryType = false;
          var hasSecondaryType = false;
          var hasExcludedType = false;

          // Check for primary types and push onto array for primary results
          for (var j=0; j < primaryTypes.length; j++) {
            if (places[i].types.includes(primaryTypes[j])) {
              console.log('Primary: ' + places[i].name);
              hasPrimaryType = true;
            }
          }
          // Push onto the array
          if (hasPrimaryType) {
            console.log('Pushed to primary: ' + places[i].name);
            primaryResults.push(places[i]);
          }

          // If the primary array doesn't contain the result, check for secondary types...
          // ...but make sure that it doesn't have a type on the excluded list
          if (!primaryResults.includes(places[i])) {
            for (var k=0; k < secondaryTypes.length; k++) {
              if (places[i].types.includes(secondaryTypes[k])) {
                console.log('Secondary: ' + places[i]);
                hasSecondaryType = true;
                for (var l=0; l < excludedTypes.length; l++) {
                  if(places[i].types.includes(excludedTypes[l])) {
                    console.log('Exclude: ' + places[i]);
                    hasExcludedType = true;
                  }
                }
              }
            }
            // Push onto array for secondary results if it has a secondary (without excluded) type
            if (hasSecondaryType && !hasExcludedType) {
              console.log('Pushed to secondary: ' + places[i].name);
              secondaryResults.push(places[i]);
            }
          }
        }

        // Combine primary and secondary arrays
        sortedResults = primaryResults.concat(secondaryResults);

        if (sortedResults.length > 0) {
          // Adds search results to sessionStorage
          app.models.places.add(sortedResults);
        } else {
          app.models.places.init();
          app.views.alerts.info('Your request returned no results.');
          app.views.results.render();
        }
        resolve();
      });
    },
    // Updates results on page
    updatePage: function() {
      return new Promise(function(resolve, reject) {
        var places = app.models.places.get();
        var paginationObj = app.models.places.paginationObj;

        if (places) {
          // Only set location attributes and it to recent searches if it's the first request of the location
          if (app.controller.newSearch) {
            var totalItems = places.length;

            app.models.searchLocation.setTotalItems(paginationObj.hasNextPage ? totalItems + '+' : totalItems);
            app.models.recentSearches.add();

            // Set message for alert (first request of location only)
            var msg = (!app.config.settings.search.topResultsOnly && paginationObj.hasNextPage) ? 'More than ' : '';
            app.views.alerts.success(msg + totalItems + ' matches! Click on an item for more details.');
          }

          // Handle > 20 matches (Google returns a max of 20 by default)
          if (!app.config.settings.search.topResultsOnly && paginationObj.hasNextPage) {
            // Prevent addition of locations to Recent Searches if more button is pressed
            app.controller.newSearch = false;
            // Attaches click listener to moreResultsBtn for pagination.nextPage()
            app.views.moreResultsBtn.addNextPageFn(paginationObj);
            app.views.moreResultsBtn.show();
          } else {
            app.views.moreResultsBtn.hide();
          }
        }

        // Set placeholder attribute on textbox
        app.views.form.setTboxPlaceholder();

        // Render views with updated results
        app.views.recentSearches.render();
        app.views.results.render();
        resolve();
      });
    },
    // Sets the initial deails of the requested place for viewing details about it
    setSelectedPlaceDetails: function(place) {
      return new Promise(function(resolve, reject) {
        app.models.selectedPlace.init();
        app.models.selectedPlace.setPlaceId(place.place_id);
        app.models.selectedPlace.setLat(place.geometry.location.lat);
        app.models.selectedPlace.setLng(place.geometry.location.lng);
        app.models.selectedPlace.setName(place.name);
        app.models.selectedPlace.setDrivingInfo(place.drivingInfo.distance, place.drivingInfo.duration);
        resolve();
      });
    },
    // This requests details of the selectedPlace from Google
    requestPlaceDetails: function() {
      return new Promise(function(resolve, reject) {
        var params = { placeId: app.models.selectedPlace.placeId };

        service = new google.maps.places.PlacesService(app.views.map.map);
        service.getDetails(params, callback);

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
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
          } else {
            app.views.alerts.error('Sorry, please try again.');
          }
        }
      });
    },
    // Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
    requestDrivingDistance: function() {
      return new Promise(function(resolve, reject) {
        // Set params for search (use userLocation if available)
        var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
        var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
        var origin = new google.maps.LatLng(lat, lng);
        var destination = new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng);
        var params = {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        // Request the distance & pass to callback
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(params, callback);

        function callback(results, status) {
          if (status == google.maps.DistanceMatrixStatus.OK) {
            var distance, duration;
            // Guard against no transit option to destination
            if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
              distance = results.rows[0].elements[0].distance.text;
              duration = results.rows[0].elements[0].duration.text;
            }
            // Add distance and duration info
            app.models.selectedPlace.setDrivingInfo(distance, duration);
            resolve();
          }
        }
      });
    },
    // Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
    requestTransitDistance: function() {
      return new Promise(function(resolve, reject) {
        // Set params for search (use userLocation if available)
        var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
        var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
        var origin = new google.maps.LatLng(lat, lng);
        var destination = new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng);
        var params = {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: { modes: [google.maps.TransitMode.SUBWAY] },
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        // Request the distance & pass to callback
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(params, callback);

        function callback(results, status) {
          if (status == google.maps.DistanceMatrixStatus.OK) {
            var distance, duration;
            // Guard against no transit option to destination
            if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
              distance = results.rows[0].elements[0].distance.text;
              duration = results.rows[0].elements[0].duration.text;
            }
            // Add distance and duration info
            app.models.selectedPlace.setTransitInfo(distance, duration);
            resolve();
          }
        }
      });
    },
    // Handle results for an individual place
    updateModal: function() {
      app.views.itemModal.populate();
      app.views.itemModal.show();
    },
    // Sets the location to be used by Google Places Search when a location is selected from Recent Places
    setSearchLocation: function(location) {
      app.models.searchLocation.setLat(location.lat);
      app.models.searchLocation.setLng(location.lng);
      app.models.searchLocation.setFormattedAddress(location.formattedAddress);
      app.models.searchLocation.setTotalItems(location.totalItems);
    }
  };

})();
