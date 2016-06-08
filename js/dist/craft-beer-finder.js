/***************
  Search config
****************/

var app = app || {};

(function() {

  app.config = {
    init: function() {
      this.settings = {
        search: {
          // itemType - Can change: This can be set to anything that you'd like to search for (i.e. 'craft beer' or 'brewery')
          itemType: 'craft beer',

          // rankBy -  Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
          rankBy: google.maps.places.RankBy.DISTANCE,

          // orderByDistance - Can change: Setting 'true' will force a reordering of results by distance (results from Google's RankBy.DISTANCE aren't always in order)
          // Set to 'false' if using 'rankBy: google.maps.places.RankBy.PROMINENCE' and don't want results ordered by distance
          // Sometimes using 'RankBy.PROMINENCE' and 'orderByDistance: true' returns the most accurate results by distance
          orderByDistance: true,

          // radius - Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)
          radius: '25000',

          // SEARCH SORTING/FILTERING:
          // These settings will help narrow down to relevant results
          // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

          // primaryTypes - Any result having these types will be sorted and listed first (examples: [], ['type1'], ['type1, 'type2'], etc.)
          primaryTypes: ['bar', 'liquor_store'],

          // secondaryTypes: Any result having these types will be listed after primaryTypes (examples: [], ['type1'], ['type1, 'type2'], etc.)
          secondaryTypes: ['restaurant'],

          // excludedTypes: Any result having these types will excluded from the results (examples: [], ['type1'], ['type1, 'type2'], etc.)
          excludedTypes: [],

          // topResultsOnly -  Can change: Allows search to return more than 1 set of results (true/false)
          topResultsOnly: false
        }
      };
      // Set your API key for Google Maps services
      this.google = {
        apiKey: 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo'
      };
      this.google.geocodingAPI = {
        reqURL: 'https://maps.googleapis.com/maps/api/geocode/json?'
      };
    }
  };

})();

/********************************************************************
  formSearch() - Controls the flow of a search initiated by the form
*********************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.formSearch = function() {
    this.newSearch = true;

    app.models.userLoc.init();

    app.controllers.getGeocode()
      .then(app.controllers.reqPlaces)
      .then(function() {
        var places = app.models.places.get();
        // TO-DO: Set a console.dir(places) and test (sorting usually happens after this)
        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }
        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }
        // TO-DO: Possibly remove the variables and userLoc below
        var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
        var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
        return app.controllers.reqMultiDistance(lat, lng, placesCoords);
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

/*******************************************************************************************
  geolocationSearch() - Controls the flow of a search initiated by the 'My Location' button
********************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.geolocationSearch = function() {
    this.newSearch = true;

    // TO-DO: Possibly remove this if the...
    // var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
    // var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
    // ...is removed
    app.models.searchLoc.init();

    app.controllers.getCurrentLocation()
      .then(app.controllers.reverseGeocode)
      .then(app.controllers.reqPlaces)
      .then(function() {
        var places = app.models.places.get();
        // TO-DO: Set a console.dir(places) and test (sorting usually happens after this)
        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }
        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }
        // TO-DO: Possibly remove the variables and searchLoc below
        var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
        var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
        return app.controllers.reqMultiDistance(lat, lng, placesCoords);
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

// Code related to passing data to models

(function() {

  app.controllers = app.controllers || {};

  // addRecentSearch() - Adds a location to Recent Searches after a search
  app.controllers.addRecentSearch = function() {
    app.models.recentSearches.add();
  };

  // setSelectedPlaceDetails - Sets the initial deails of the requested place for viewing details about it
  app.controllers.setSelectedPlaceDetails = function(place) {
    return new Promise(function(resolve) {
      app.models.selectedPlace.init();
      app.models.selectedPlace.placeId = place.place_id;
      app.models.selectedPlace.lat = place.geometry.location.lat;
      app.models.selectedPlace.lng = place.geometry.location.lng;
      app.models.selectedPlace.name = place.name;
      app.models.selectedPlace.setDrivingInfo(place.drivingInfo.distance, place.drivingInfo.duration);
      resolve();
    });
  };

  // setSearchLocation - Sets the location to be used by Google Places Search when a location is selected from Recent Places
  app.controllers.setSearchLocation = function(location) {
    app.models.searchLoc.lat = location.lat;
    app.models.searchLoc.lng = location.lng;
    app.models.searchLoc.setFormattedAddress(location.formattedAddress);
    app.models.searchLoc.setTotalItems(location.totalItems);
  };

})();

/****************************************************************************************************
  recentSearch() - Controls the flow of a search initiated by clicking a location in Recent Searches
*****************************************************************************************************/

(function() {

  app.controllers = app.controllers || {};

  app.controllers.recentSearch = function(location) {
    this.newSearch = true;

    app.models.userLoc.init();
    app.controllers.setSearchLocation(location);

    app.controllers.reqPlaces()
      .then(function() {
        var places = app.models.places.get();
        // TO-DO: Set a console.dir(places) and test (sorting usually happens after this)
        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }
        // Push lat, lng for places onto new destinations array ( [{lat, lng}, {lat, lng}] )
        var placesCoords = [];
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }
        // TO-DO: Possibly remove the variables and userLoc below
        var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
        var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
        return app.controllers.reqMultiDistance(lat, lng, placesCoords);
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
        app.controllers.updatePage();
        app.views.page.enableButtons();
      })
      .catch(app.controllers.stopExecution);
  };

})();

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
        for (var i=0; i < places.length; i++) {
          var latLng = { lat: null, lng: null };
          latLng.lat = places[i].geometry.location.lat;
          latLng.lng = places[i].geometry.location.lng;
          placesCoords.push(latLng);
        }
        // TO-DO: Possibly remove the variables and searchLoc below
        var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
        var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
        return app.controllers.reqMultiDistance(lat, lng, placesCoords);
      })
      .then(function(results) {
        var places = app.models.places.get();

        // Flatten to a one-dimensional array
        if (places.primary || places.secondary) {
          places = places.primary.concat(places.secondary);
        }

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
      })
      .catch(app.controllers.stopExecution);
  };

  /***************************************************************************
    requestMoreResults() - Requests more results if > 20 results are returned
  ****************************************************************************/
  app.controllers.requestMoreResults = function() {
    var paginationObj = app.models.places.paginationObj;
    paginationObj.nextPage();
    // TO-DO: Fix this hack
    // Need to wait for AJAX request to finish before moving on and can't use JS promise
    window.setTimeout(function() {
      app.controllers.reqMultiDistance()
        .then(app.controllers.sortPlaces)
        .then(app.controllers.updatePage)
        .then(app.views.page.enableButtons)
        .catch(app.controllers.stopExecution);
    }, 2000);
  };

})();

// Code related to updating views

(function() {

  app.controllers = app.controllers || {};

  // updatePage - Updates list of results and recent searches
  app.controllers.updatePage = function() {
    var paginationObj = app.models.places.paginationObj;
    var places = app.models.places.get();

    // Only set location attributes if it's the first request of the location
    if (app.controllers.newSearch) {
      app.views.alerts.show('success', app.models.searchLoc.totalItems + ' matches! Click on an item for more details.');
    }

    // Handle > 20 matches (Google returns a max of 20 by default)
    if (!app.config.settings.search.topResultsOnly && paginationObj.hasNextPage) {
      // Prevent addition of locations to Recent Searches if more button is pressed
      app.controllers.newSearch = false;
      // Attaches click listener to moreResultsBtn for pagination.nextPage()
      app.views.moreResultsBtn.addNextPageFn(paginationObj);
      app.views.moreResultsBtn.show();
    } else {
      app.views.moreResultsBtn.hide();
    }

    // Set placeholder attribute on textbox
    app.views.form.setTboxPlaceholder();

    // Render views with updated results
    app.views.recentSearches.render();
    app.views.results.render();
  };

  // updateModal - Updates model when a place is selected
  app.controllers.updateModal = function() {
    return new Promise(function(resolve) {
      app.views.placeModal.populate();
      app.views.placeModal.show();
      resolve();
    });
  };

})();

/***************
  Start the app
****************/

$(function() {

  app.config.init();
  app.models.searchLoc.init();
  app.models.places.init();
  app.views.page.init();
  app.views.map.init();
  app.views.form.init();
  app.views.locationBtn.init();
  app.views.alerts.init();
  app.views.results.init();
  app.views.recentSearches.init();
  app.views.placeModal.init();
  app.views.moreResultsBtn.init();

});

/**************
  Places Model
***************/

(function() {

  app.models = app.models || {};

  app.models.places = {
    init: function() {
      sessionStorage.clear();
      this.paginationObj = null;
    },
    // Adds an array of results of search to sessionStorage
    add: function(places) {
      sessionStorage.setItem('places', JSON.stringify(places));
    },
    // Retrieves an array of results of search from sessionStorage
    get: function() {
      return JSON.parse(sessionStorage.getItem('places'));
    },
    find: function(requestedPlace) {
      var places = this.get();

      for (var i=0; i < places.primary.length; i++) {
        if (places.primary[i].place_id === requestedPlace.place_id) {
          return places.primary[i];
        }
      }

      for (var j=0; j < places.secondary.length; j++) {
        if (places.secondary[j].place_id === requestedPlace.place_id) {
          return places.secondary[j];
        }
      }
    }
  };

})();

/***********************
  Recent Searches Model
************************/

(function() {

  app.models = app.models || {};

  app.models.recentSearches = {
    add: function() {
      var cachedSearches = this.get();

      if (!cachedSearches) {
        cachedSearches = [];
      } else if (cachedSearches.length >= 5) {
        cachedSearches.pop();
      }

      var newLocation = {};
      newLocation.lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      newLocation.lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      newLocation.formattedAddress = app.models.userLoc.formattedAddress || app.models.searchLoc.formattedAddress;
      newLocation.totalItems = app.models.userLoc.totalItems || app.models.searchLoc.totalItems;
      cachedSearches.unshift(newLocation);

      localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
    },
    get: function() {
      return JSON.parse(localStorage.getItem('recentSearches'));
    }
  };

})();

/***********************
  Search Location Model
************************/

(function() {

  app.models = app.models || {};

  app.models.searchLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    }
  };

})();

/**********************
  Selected Place Model
***********************/

(function() {

  app.models = app.models || {};

  app.models.selectedPlace = {
    init: function() {
      this.placeId = null;
      this.lat = null;
      this.lng = null;
      this.name = null;
      this.openNow = null;
      this.website = null;
      this.address = null;
      this.googleMapsUrl = null;
      this.phoneNum = null;
      this.drivingInfo = {};
      this.transitInfo = {};
      this.hoursOpen = null;
    },
    setOpenNow: function(openNow) {
      this.openNow = openNow ? 'Yes' : 'No';
    },
    setWebsite: function(website) {
      this.website = website ? website : '';
    },
    setAddress: function(address) {
      this.address = address.replace(/, United States/i, '');
    },
    setGoogleMapsUrl: function(googleMapsUrl) {
      this.googleMapsUrl = googleMapsUrl ? googleMapsUrl : '';
    },
    setPhoneNum: function(phoneNum) {
      this.phoneNum = phoneNum ? phoneNum : '';
    },
    setDrivingInfo: function(distance, duration) {
      this.drivingInfo.distance = distance ? distance : '';
      this.drivingInfo.duration = duration ? duration : '';
    },
    setTransitInfo: function(distance, duration) {
      this.transitInfo.distance = distance ? distance : '';
      this.transitInfo.duration = duration ? duration : '';
    },
    setHoursOpen: function(hoursOpen) {
      this.hoursOpen = hoursOpen ? hoursOpen : '';
    }
  };

})();

/*********************
  User Location Model
**********************/

(function() {

  app.models = app.models || {};

  app.models.userLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    }
  };

})();

// Code related to Google Maps Distance Matrix API

(function() {

  app.controllers = app.controllers || {};

  // reqMultiDistance - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  app.controllers.reqMultiDistance = function(lat, lng, destinations) {
    return new Promise(function(resolve, reject) {
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();

      for (var i=0; i < destinations.length; i++) {
        params.destinations.push(new google.maps.LatLng(destinations[i].lat, destinations[i].lng));
      }

      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        resolve(results);
      }
    });
  };

  // reqDrivingDistance - Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
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

  // reqTransitDistance - Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
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

// Code related to HTML5 Geolocation

(function() {

  app.controllers = app.controllers || {};

  // getCurrentLocation - HTML5 geocoding request for lat/lng for 'My Location' button
  app.controllers.getCurrentLocation = function() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        reject({ type: 'error', text: 'Sorry, geolocation is not supported in your browser.' });
        return;
      }

      var success = function(position) {
        app.models.userLoc.lat = position.coords.latitude;
        app.models.userLoc.lng = position.coords.longitude;
        resolve();
      };

      var error = function() {
        reject({ type: 'error', text: 'An error occurred. Please try again.' });
        return;
      };
      
      var options = { enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
  };

})();

// Code related to Google Geocoding API
// This could be performed using a Google Maps object but I wanted to practice using AJAX requests

(function() {

  app.controllers = app.controllers || {};

  // getGeocode - Takes a city, state and converts it to lat/lng using Google Geocoding API
  app.controllers.getGeocode = function() {
    return new Promise(function(resolve, reject) {
      var tboxVal = app.views.form.cityStateTbox.value;
      if (!tboxVal) {
        reject({ type: 'error', text: 'Please enter a location.' });
        return;
      }

      // AJAX request for lat/lng for form submission
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status !== 200) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          var response = JSON.parse(httpRequest.responseText);
          if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
            reject({ type: 'error', text: 'Sorry, that location could not be found.' });
            return;
          }

          app.models.searchLoc.lat = response.results[0].geometry.location.lat;
          app.models.searchLoc.lng = response.results[0].geometry.location.lng;
          app.models.searchLoc.setFormattedAddress(response.results[0].formatted_address);
          resolve();
        }
      };

      httpRequest.send();
    });
  };

  // reverseGeocode - Converts lat/lng to a city, state
  app.controllers.reverseGeocode = function() {
    return new Promise(function(resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.config.google.apiKey + '&latlng=' + app.models.userLoc.lat + ',' + app.models.userLoc.lng;

      httpRequest.open('GET', app.config.google.geocodingAPI.reqURL + params, true);
      httpRequest.send();

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status !== 200) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          var response = JSON.parse(httpRequest.responseText);
          var formattedAddress = response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name;
          // Sets .formattedAddress as city, state (i.e. New York, NY)
          app.models.userLoc.setFormattedAddress(formattedAddress);
          resolve();
        }
      };
    });
  };

})();

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

// Code related to sorting results

(function() {

  app.controllers = app.controllers || {};

  // insertionSort - Sorts place results by distance
  app.controllers.insertionSort = function(unsorted) {
    var length = unsorted.length;

    for(var i=0; i < length; i++) {
      var temp = unsorted[i];

      for(var j=i-1; j >= 0 && (parseFloat(unsorted[j].drivingInfo.value) > parseFloat(temp.drivingInfo.value)); j--) {
        unsorted[j+1] = unsorted[j];
      }

      unsorted[j+1] = temp;
    }
  };

  // sortPlaces -Handles processing of places returned from Google.
  app.controllers.sortPlaces = function(places) {
      var primaryTypes = app.config.settings.search.primaryTypes;
      var secondaryTypes = app.config.settings.search.secondaryTypes;
      var excludedTypes = app.config.settings.search.excludedTypes;
      var primaryResults = [];
      var secondaryResults = [];
      var sortedResults = { primary: null, secondary: null };

      // Sorts results based on relevent/exlcuded categories in app.config.settings.search
      for (var i=0; i < places.length; i++) {
        var hasPrimaryType = false;
        var hasSecondaryType = false;
        var hasExcludedType = false;

        // Check for primary types and push onto array for primary results
        for (var j=0; j < primaryTypes.length; j++) {
          if (places[i].types.includes(primaryTypes[j])) {
            hasPrimaryType = true;
          }
        }
        // Push onto the array
        if (hasPrimaryType) {
          primaryResults.push(places[i]);
        }

        // If the primary array doesn't contain the result, check for secondary types...
        // ...but make sure that it doesn't have a type on the excluded list
        if (!primaryResults.includes(places[i])) {
          for (var k=0; k < secondaryTypes.length; k++) {
            if (places[i].types.includes(secondaryTypes[k])) {
              hasSecondaryType = true;
              for (var l=0; l < excludedTypes.length; l++) {
                if(places[i].types.includes(excludedTypes[l])) {
                  hasExcludedType = true;
                }
              }
            }
          }
          // Push onto array for secondary results if it has a secondary (without excluded) type
          if (hasSecondaryType && !hasExcludedType) {
            secondaryResults.push(places[i]);
          }
        }
      }

      // Re-sort option because Google doesn't always return places by distance accurately
      if (app.config.settings.search.orderByDistance) {
        app.controllers.insertionSort(primaryResults);
        app.controllers.insertionSort(secondaryResults);
      }

      if (primaryResults.length === 0 && secondaryResults.length === 0) {
        reject({ type: 'info', text: 'Your request returned no results.' });
        return;
      }

      sortedResults.primary = primaryResults;
      sortedResults.secondary = secondaryResults;

      return sortedResults;
  };

})();

/**********************
  Code for page alerts
***********************/

(function() {

  app.views = app.views || {};

  app.views.alerts = {
    init: function() {
      // Collect DOM elements
      this.alert = document.getElementById('alert');
      // Set default values on DOM elements
      this.alert.classList.add('hidden');
    },
    clear: function() {
      this.alert = document.getElementById('alert');
      this.alert.classList.add('hidden');
      var alertTypes = ['alert-danger', 'alert-info', 'alert-success'];
      for (var i = 0; i < alertTypes.length; i++) {
        this.alert.classList.remove(alertTypes[i]);
      }
      this.alert.textContent = null;
    },
    show: function(type, msg) {
      var alertClass;

      if (type === 'error') {
        alertClass = 'alert-danger';
      } else if (type === 'info') {
        alertClass = 'alert-info';
      } else if (type === 'success') {
        alertClass = 'alert-success';
      }

      this.alert.textContent = msg;
      this.alert.classList.add(alertClass);
      this.alert.classList.remove('hidden');
    }
  };

})();

/*******************************
  Code for the form and buttons
********************************/

(function() {

  app.views = app.views || {};

  // City/state form
  app.views.form = {
    init: function() {
      // Collect DOM elements
      this.cityStateTbox = document.getElementById('cityStateTbox');
      this.searchBtn = document.getElementById('searchBtn');
      // Set default values on DOM elements
      this.cityStateTbox.setAttribute('autofocus', true);
      this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
      // Add click handlers
      this.cityStateTbox.addEventListener('click', function() {
        this.value = null;
      });
      this.cityStateTbox.addEventListener('keyup', function(e) {
        if (e.keyCode === 13) {
          app.views.page.disableButtons();
          app.views.page.clear();
          app.controllers.formSearch();
        }
      });
      this.searchBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        app.controllers.formSearch();
      });
    },
    setTboxPlaceholder: function() {
      this.cityStateTbox.value = null;
      this.cityStateTbox.setAttribute('placeholder', app.models.userLoc.formattedAddress || app.models.searchLoc.formattedAddress);
    },
    disableSearchBtn: function() {
      this.searchBtn.setAttribute('disabled', true);
    },
    enableSearchBtn: function() {
      this.searchBtn.removeAttribute('disabled');
    }
  };

  // Location button
  app.views.locationBtn = {
    init: function() {
      // Collect DOM elements
      this.locationBtn = document.getElementById('locationBtn');
      // Add click handlers
      this.locationBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        app.controllers.geolocationSearch();
      });
    },
    disable: function() {
      this.locationBtn.setAttribute('disabled', true);
    },
    enable: function() {
      this.locationBtn.removeAttribute('disabled');
    }
  };

  // More results button if > 20 results are returned from the search
  app.views.moreResultsBtn = {
    init: function() {
      // Collect DOM elements
      this.moreResultsBtn = document.getElementById('moreResultsBtn');
      // Set default values on DOM elements
      this.moreResultsBtn.classList.add('hidden');
      // Add click handlers
      this.moreResultsBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        window.scroll(0, 0);
      });
    },
    addNextPageFn: function() {
      this.moreResultsBtn.onclick = function() {
        app.controllers.requestMoreResults();
      };
    },
    show: function() {
      this.moreResultsBtn.classList.remove('hidden');
      // Google Places search requires 2 seconds between searches
      window.setTimeout(function() {
        moreResultsBtn.removeAttribute('disabled');
      }, 2000);
    },
    disable: function() {
      this.moreResultsBtn.setAttribute('disabled', true);
    },
    hide: function() {
      this.moreResultsBtn.classList.add('hidden');
    }
  };

})();

/********************************************
  Code interacting with elements on the page
*********************************************/

(function() {

  app.views = app.views || {};

  // Google Map's map object (needed for API but not displayed on page)
  app.views.map = {
    init: function() {
      // Collect DOM elements
      this.map = document.getElementById('map');
    }
  };

  // Control multiple items on the page
  app.views.page = {
    init: function() {
      // Initialize page settings
      var searchItemTypeCaps = '';
      var searchItemType = app.config.settings.search.itemType.split(/\s+/);
      for (var i=0; i < searchItemType.length; i++) {
        searchItemTypeCaps += ' ' + searchItemType[i].charAt(0).toUpperCase() + searchItemType[i].slice(1);
      }
      var pageTitle = searchItemTypeCaps + ' Finder';
      document.title = pageTitle;
      document.getElementById('heading').textContent = pageTitle;
    },
    clear: function() {
      app.views.alerts.clear();
      app.views.results.clear();
    },
    disableButtons: function() {
      app.views.form.disableSearchBtn();
      app.views.locationBtn.disable();
    },
    enableButtons: function() {
      window.setTimeout(function() {
        app.views.form.enableSearchBtn();
        app.views.locationBtn.enable();
      }, 250);
    }
  };

})();

/****************************************
  Code for the modal of a selected place
*****************************************/

(function() {

  app.views = app.views || {};

  // Modal that displays details when selecting a place
  app.views.placeModal = {
    init: function() {
      this.placeModal = document.getElementById('placeModal');
      this.placeModalTitle = document.getElementById('placeModalTitle');
      this.placeModalOpenNow = document.getElementById('placeModalOpenNow');
      this.placeModalWebsite = document.getElementById('placeModalWebsite');
      this.placeModalAddress = document.getElementById('placeModalAddress');
      this.placeModalPhoneNum = document.getElementById('placeModalPhoneNum');
      this.placeModalDrivingInfo = document.getElementById('placeModalDrivingInfo');
      this.placeModalDistanceWarning = document.getElementById('placeModalDistanceWarning');
      this.placeModalTransitInfo = document.getElementById('placeModalTransitInfo');
      this.placeModalHoursOpen = document.getElementById('placeModalHoursOpen');
      // Set defaults
      this.placeModalDistanceWarning.classList.add('hidden');
    },
    populate: function() {
      // Reset hidden fields on each render
      var sections = document.getElementById('placeModalBody').children;
      for (var i=0; i < sections.length; i++) {
        sections[i].classList.remove('hidden');
      }

      var currentDay = new Date().getDay();
      // Adjust to start week on Monday for hoursOpen
      currentDay -= 1;
      // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
      currentDay = currentDay === -1 ? 6 : currentDay;
      this.placeModalTitle.textContent = app.models.selectedPlace.name;

      if (app.models.selectedPlace.openNow) {
        this.placeModalOpenNow.textContent = app.models.selectedPlace.openNow;
      } else {
        this.placeModalOpenNow.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.website) {
        this.placeModalWebsite.setAttribute('href', app.models.selectedPlace.website);
        this.placeModalWebsite.textContent = app.models.selectedPlace.website;
      } else {
        this.placeModalWebsite.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.address) {
        this.placeModalAddress.setAttribute('href', app.models.selectedPlace.googleMapsUrl);
        this.placeModalAddress.textContent = app.models.selectedPlace.address;
      } else {
        this.placeModalAddress.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.phoneNum) {
        this.placeModalPhoneNum.setAttribute('href', 'tel:' + app.models.selectedPlace.phoneNum);
        this.placeModalPhoneNum.textContent = app.models.selectedPlace.phoneNum;
      } else {
        this.placeModalPhoneNum.parentElement.classList.add('hidden');
      }

      // Only show message if geolocation search isn't being used
      if (app.models.userLoc.lat && app.models.userLoc.lng) {
        this.placeModalDistanceWarning.classList.add('hidden');
      }

      this.placeModalDistanceWarning.addEventListener('mouseover', function() {
        this.classList.add('hovered');
      });

      this.placeModalDistanceWarning.addEventListener('mouseout', function() {
        this.classList.remove('hovered');
        this.classList.remove('clicked');
      });

      this.placeModalDistanceWarning.addEventListener('click', function() {
        this.classList.add('clicked');
        // Hack to help prevent exceeding Google's query limits
        window.setTimeout(function() {
          app.controllers.switchToGeolocation();
        }, 1500);
      });

      if (app.models.selectedPlace.drivingInfo.duration || app.models.selectedPlace.drivingInfo.distance) {
        this.placeModalDrivingInfo.textContent = app.models.selectedPlace.drivingInfo.duration + ' (' + app.models.selectedPlace.drivingInfo.distance + ')';
      } else {
        this.placeModalDrivingInfo.textContent = 'No driving options';
      }
      if (app.models.selectedPlace.transitInfo.duration || app.models.selectedPlace.transitInfo.distance) {
        this.placeModalTransitInfo.textContent = app.models.selectedPlace.transitInfo.duration + ' (' + app.models.selectedPlace.transitInfo.distance + ')';
      } else {
        this.placeModalTransitInfo.textContent = 'No transit options';
      }

      this.placeModalHoursOpen.textContent = null;
      if (app.models.selectedPlace.hoursOpen) {
        for (var j=0; j < app.models.selectedPlace.hoursOpen.length; j++) {
          var li = document.createElement('li');
          // Split hoursOpen on ':'
          var dayTime = app.models.selectedPlace.hoursOpen[j].split(/:\s/);
          // <span> is needed to highlight hours for current day
          li.innerHTML = '<span><strong>' + dayTime[0] + ':</strong>' + dayTime[1] + '</span>';
          // Highlight current day of week
          if (j === currentDay) {
            li.classList.add('current-day');
          }
          this.placeModalHoursOpen.appendChild(li);
        }
      } else {
        this.placeModalHoursOpen.parentElement.classList.add('hidden');
      }
    },
    show: function() {
      $('#placeModal').modal('show');
    },
    hide: function() {
      $('#placeModal').modal('hide');
    }
  };

})();

/***********************************
  Code for the Recent Searches list
************************************/

(function() {

  app.views = app.views || {};

  // Recent searches list
  app.views.recentSearches = {
    init: function() {
      // Collect DOM elements
      this.recentSearchesList = document.getElementById('recentSearchesList');
      this.render();
    },
    render: function() {
      this.recentSearchesList.textContent = null;
      var recentSearches = app.models.recentSearches.get();

      if (!recentSearches) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.classList.add('text-center');
        li.textContent = 'You have no recent searches.';
        this.recentSearchesList.appendChild(li);
        return;
      }

      for (var i=0; i < recentSearches.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = recentSearches[i].formattedAddress;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = recentSearches[i].totalItems;

        li.appendChild(span);

        li.addEventListener('click', (function(location) {
          return function() {
            app.views.page.disableButtons();
            app.views.page.clear();
            app.controllers.recentSearch(location);
          };
        })(recentSearches[i]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        this.recentSearchesList.appendChild(li);
      }
    }
  };

})();

/***************************
  Code for the results list
****************************/

(function() {

  app.views = app.views || {};

  // Results list
  app.views.results = {
    init: function() {
      // Collect DOM elements
      this.primaryResults = document.getElementById('primaryResults');
      this.primaryResultsList = document.getElementById('primaryResultsList');
      this.secondaryResults = document.getElementById('secondaryResults');
      this.secondaryResultsList = document.getElementById('secondaryResultsList');
      // Set default values on DOM elements
      this.primaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
    },
    clear: function() {
      this.secondaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
      this.primaryResultsList.textContent = null;
      this.secondaryResultsList.textContent = null;
      app.views.moreResultsBtn.hide();
      app.views.moreResultsBtn.disable();
    },
    render: function() {
      this.primaryResults.classList.add('hidden');
      this.secondaryResults.classList.add('hidden');
      this.primaryResultsList.textContent = null;
      this.secondaryResultsList.textContent = null;

      var places = app.models.places.get();
      if (!places) {
        app.views.alerts.show('info', 'Your request returned no results.');
        return;
      }

      // Add primary results to DOM
      for (var i=0; i < places.primary.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places.primary[i].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places.primary[i].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places.primary[i]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        this.primaryResultsList.appendChild(li);
      }

      // Add secondary results to DOM
      for (var j=0; j < places.secondary.length; j++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places.secondary[j].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places.secondary[j].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places.secondary[j]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        this.secondaryResultsList.appendChild(li);
      }

      if (places.primary.length > 0) {
        this.primaryResults.classList.remove('hidden');
      }

      if (places.secondary.length > 0) {
        this.secondaryResults.classList.remove('hidden');
      }
      // Select results tab and panel to show new results
      $('#resultsTab').tab('show');
    }
  };

})();
