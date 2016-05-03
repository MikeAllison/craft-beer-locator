/* jshint -W083 */ // Silence JSHint's warning "Don't make functions within a loop" to allow closures

(function(){
  var app, model, controller, views;

/* ===== APP CONFIG SETTINGS ===== */

  app = {
    init: function() {
      // Set the type and radius of thing to search for (i.e. 'brewery' or 'craft beer')
      this.settings = {
        search: {
          // itemType - Can change: This can be set to anything that you'd like to search for
          itemType: 'craft beer',
          // rankBy -  Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
          rankBy: google.maps.places.RankBy.DISTANCE,
          // radius - Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)
          radius: '25000',

          // SEARCH SORTING/FILTERING:
          // These settings will help narrow down to relevant results
          // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

          // primaryTypes - Any result having these types will be sorted and listed first (examples: [], ['type1'], ['type1, 'type2'], etc.)
          primaryTypes: ['bar', 'store'],

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

/* ===== MODELS ===== */

  models = {
    searchLocation: {
      init: function() {
        this.lat = null;
        this.lng = null;
        this.formattedAddress = null;
        this.totalItems = null;
        this.newSearch = true;
      },
      setLat: function(lat) {
        this.lat = lat;
      },
      setLng: function(lng) {
        this.lng = lng;
      },
      setFormattedAddress: function(address) {
        this.formattedAddress = address.replace(/, USA/i, '');
      },
      setTotalItems: function(totalItems) {
        this.totalItems = totalItems;
      },
      setNewSearch: function(bool) {
        this.newSearch = bool;
      }
    },
    selectedPlace: {
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
      setPlaceId: function(placeId) {
        this.placeId = placeId;
      },
      setLat: function(lat) {
        this.lat = lat;
      },
      setLng: function(lng) {
        this.lng = lng;
      },
      setName: function(name) {
        this.name = name;
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
    },
    places: {
      init: function() {
        sessionStorage.clear();
        this.paginationObj = {};
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

        for (var i=0; i < places.length; i++) {
          if (places[i].place_id === requestedPlace.place_id) {
            return places[i];
          }
        }
      },
      setPaginationObj: function(paginationObj) {
        this.paginationObj = paginationObj;
      }
    },
    recentSearches: {
      add: function() {
        var cachedSearches = this.get();

        if (!cachedSearches) {
          cachedSearches = [];
        } else if (cachedSearches.length >= 5) {
          cachedSearches.pop();
        }

        var newSearch = {};
        newSearch.lat = models.searchLocation.lat;
        newSearch.lng = models.searchLocation.lng;
        newSearch.formattedAddress = models.searchLocation.formattedAddress;
        newSearch.totalItems = models.searchLocation.totalItems;
        cachedSearches.unshift(newSearch);

        localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
      },
      get: function() {
        return JSON.parse(localStorage.getItem('recentSearches'));
      }
    }
  };

  /* ===== CONTROLLER ===== */

  controller = {
    init: function() {
      app.init();
      models.searchLocation.init();
      models.places.init();
      views.page.init();
      views.map.init();
      views.form.init();
      views.locationBtn.init();
      views.alerts.init();
      views.itemModal.init();
      views.results.init();
      views.moreResultsBtn.init();
      views.recentSearches.init();
    },
    // Controls the flow of a search initiated by the form
    formSearch: function() {
      controller.getGeocode()
        .then(controller.requestPlaces)
        .then(controller.requestDrivingDistance)
        .then(controller.sortPlaces)
        .then(controller.updatePage)
        .then(views.page.enableButtons);
    },
    // Controls the flow of a search initiated by the 'My Location' button
    geolocationSearch: function() {
      controller.getCurrentLocation()
        .then(controller.reverseGeocode)
        .then(controller.requestPlaces)
        .then(controller.requestDrivingDistance)
        .then(controller.sortPlaces)
        .then(controller.updatePage)
        .then(views.page.enableButtons);
    },
    // Controls the flow of a search initiated by clicking a location in Recent Searches
    recentSearch: function(location) {
      controller.setSearchLocation(location);
      controller.requestPlaces()
        .then(controller.requestDrivingDistance)
        .then(controller.sortPlaces)
        .then(controller.updatePage)
        .then(views.page.enableButtons);
    },
    // Controls the flow for acquiring details when a specific place is selected
    getDetails: function(place) {
      var requestedPlace = models.places.find(place);
      controller.setSelectedPlaceDetails(requestedPlace)
        .then(controller.requestPlaceDetails)
        .then(controller.requestTransitDistance)
        .then(controller.updateModal);
    },
    requestMoreResults: function() {
      console.log('requestMoreResults called');
      var paginationObj = models.places.paginationObj;
      paginationObj.nextPage();
      // TO-DO: Fix this hack
      // Need to wait for AJAX request to finish before moving on and can't use JS promise
      window.setTimeout(function() {
        controller.requestDrivingDistance()
          .then(controller.sortPlaces)
          .then(controller.updatePage)
          .then(views.page.enableButtons);
      }, 2000);
    },
    // Takes a city, state and converts it to lat/lng using Google Geocoding API
    // This could be performed using a Google Maps object but I wanted to practice using AJAX requests
    getGeocode: function() {
      console.log('getGeocode - Start');
      return new Promise(function(resolve, reject) {
        var tboxVal = views.form.cityStateTbox.value;

        if (!tboxVal) {
          views.alerts.error('Please enter a location.');
          views.page.enableButtons();
          return;
        }

        // AJAX request for lat/lng for form submission
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          views.alerts.error('Sorry, please try again.');
          views.page.enableButtons();
          return;
        }

        var params = 'key=' + app.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
        httpRequest.open('GET', app.google.geocodingAPI.reqURL + params, true);

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status !== 200) {
              views.alerts.error('Sorry, please try again.');
              views.page.enableButtons();
              return;
            } else {
              var response = JSON.parse(httpRequest.responseText);

              if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
                views.alerts.error('Sorry, that location could not be found.');
                views.page.enableButtons();
                return;
              } else {
                models.searchLocation.setLat(response.results[0].geometry.location.lat);
                models.searchLocation.setLng(response.results[0].geometry.location.lng);
                models.searchLocation.setFormattedAddress(response.results[0].formatted_address);
              }
            }
            console.log('getGeocode - End');
            resolve();
          }
        };

        httpRequest.send();
      });
    },
    // HTML5 geocoding request for lat/lng for 'My Location' button
    getCurrentLocation: function() {
      console.log('getCurrentLocation - Start');
      return new Promise(function(resolve, reject) {
        var success = function(position) {
          models.searchLocation.setLat(position.coords.latitude);
          models.searchLocation.setLng(position.coords.longitude);
          console.log('getCurrentLocation - End');
          resolve();
        };
        var error = function() {
          views.alerts.error('Sorry, please try again.');
        };
        var options = { enableHighAccuracy: true };

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(success, error, options);
        } else {
          views.alerts.error('Sorry, geolocation is not supported in your browser.');
        }
      });
    },
    // Converts lat/lng to a city, state
    reverseGeocode: function() {
      console.log('reverseGeocode - Start');
      return new Promise(function(resolve, reject) {
        var httpRequest = new XMLHttpRequest();
        var params = 'key=' + app.google.apiKey + '&latlng=' + models.searchLocation.lat + ',' + models.searchLocation.lng;

        httpRequest.open('GET', app.google.geocodingAPI.reqURL + params, true);
        httpRequest.send();

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            var response = JSON.parse(httpRequest.responseText);
            // Sets .formattedAddress as city, state (i.e. New York, NY)
            models.searchLocation.setFormattedAddress(response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name);
          }
          console.log('reverseGeocode - End');
          resolve();
        };
      });
    },
    // Sends a lat/lng to Google Places Library and stores results
    requestPlaces: function() {
      console.log('requestPlaces - Start');
      return new Promise(function(resolve, reject) {
        // Reset first request so search location is added to Recent Searches
        models.searchLocation.setNewSearch(true);
        // Set params for search
        var location = new google.maps.LatLng(models.searchLocation.lat, models.searchLocation.lng);
        var params = {
          location: location,
          rankBy: app.settings.search.rankBy,
          keyword: app.settings.search.itemType
        };

        // Radius is required on request if ranked by PROMINENCE
        if (params.rankBy === google.maps.places.RankBy.PROMINENCE) {
          params.radius = app.settings.search.radius;
        }

        // Google map isn't shown on page but is required for PlacesService constructor
        var service = new google.maps.places.PlacesService(views.map.map);
        service.nearbySearch(params, callback);

        function callback(results, status, pagination) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            // Add results to sessionStorage
            models.places.add(results);
            // Store pagination object for more results
            models.places.setPaginationObj(pagination);
          } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            models.places.init();
            views.alerts.info('Your request returned no results.');
            views.results.render();
            views.page.enableButtons();
          } else {
            models.places.init();
            views.alerts.error('Sorry, please try again.');
            views.results.render();
            views.page.enableButtons();
          }
          console.log('requestPlaces - End');
          resolve();
        }
      });
    },
    // Requests driving distance info from Google Maps Distance Matrix.
    requestDrivingDistance: function() {
      console.log('requestDrivingDistance - Start');
      return new Promise(function(resolve, reject) {
        var service = new google.maps.DistanceMatrixService();
        var origin = new google.maps.LatLng(models.searchLocation.lat, models.searchLocation.lng);
        var places = models.places.get();
        var placesWithDistance = [];

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
            if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
              // Add distance info to each result
              place.drivingInfo = {
                distance: results.rows[0].elements[0].distance.text,
                duration: results.rows[0].elements[0].duration.text
              };
            }
            placesWithDistance.push(place);
            if (placesWithDistance.length === places.length) {
              console.log('requestDrivingDistance - End');
              models.places.add(placesWithDistance);
              resolve();
            }
          }
        }
      });
    },
    // Handles processing of places returned from Google.
    sortPlaces: function() {
      console.log('sortPlaces - Start');
      return new Promise(function(resolve, reject) {
        var primaryTypes = app.settings.search.primaryTypes;
        var secondaryTypes = app.settings.search.secondaryTypes;
        var excludedTypes = app.settings.search.excludedTypes;
        var primaryResults = [];
        var secondaryResults = [];
        var sortedResults = [];
        var places = models.places.get();

        // Sorts results based on relevent/exlcuded categories in app.settings.search
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
          models.places.add(sortedResults);
        } else {
          models.places.init();
          views.alerts.info('Your request returned no results.');
          views.results.render();
        }

        console.log('sortPlaces - End');
        resolve();
      });
    },
    // Updates results on page
    updatePage: function() {
      console.log('updatePage - Start');
      return new Promise(function(resolve, reject) {
        var places = models.places.get();
        var paginationObj = models.places.paginationObj;

        if (places) {
          // Only set location attributes and it to recent searches if it's the first request of the location
          if (models.searchLocation.newSearch) {
            var totalItems = places.length;

            models.searchLocation.setTotalItems(paginationObj.hasNextPage ? totalItems + '+' : totalItems);
            models.recentSearches.add();

            // Set message for alert (first request of location only)
            var msg = (!app.settings.search.topResultsOnly && paginationObj.hasNextPage) ? 'More than ' : '';
            views.alerts.success(msg + totalItems + ' matches! Click on an item for more details.');
          }

          // Handle > 20 matches (Google returns a max of 20 by default)
          if (!app.settings.search.topResultsOnly && paginationObj.hasNextPage) {
            // Prevent addition of locations to recent searches if more button is pressed
            models.searchLocation.setNewSearch(false);
            // Attaches click listener to moreResultsBtn for pagination.nextPage()
            views.moreResultsBtn.addNextPageFn(paginationObj);
            views.moreResultsBtn.show();
          } else {
            views.moreResultsBtn.hide();
          }
        }

        // Set placeholder attribute on textbox
        views.form.setTboxPlaceholder();

        // Render views with updated results
        views.recentSearches.render();
        views.results.render();
        console.log('updatePage - End');
        resolve();
      });
    },
    // Sets the initial deails of the requested place for viewing details about it
    setSelectedPlaceDetails: function(place) {
      console.log('setSelectedPlaceDetails - Start');
      return new Promise(function(resolve, reject) {
        models.selectedPlace.init();
        models.selectedPlace.setPlaceId(place.place_id);
        models.selectedPlace.setLat(place.geometry.location.lat);
        models.selectedPlace.setLng(place.geometry.location.lng);
        models.selectedPlace.setName(place.name);
        models.selectedPlace.setDrivingInfo(place.drivingInfo.distance, place.drivingInfo.duration);
        resolve();
        console.log('setSelectedPlaceDetails - End');
      });
    },
    // This requests details of the selectedPlace from Google
    requestPlaceDetails: function() {
      console.log('requestPlaceDetails - Start');
      return new Promise(function(resolve, reject) {
        var params = { placeId: models.selectedPlace.placeId };

        service = new google.maps.places.PlacesService(views.map.map);
        service.getDetails(params, callback);

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            models.selectedPlace.setWebsite(results.website);
            models.selectedPlace.setAddress(results.formatted_address);
            models.selectedPlace.setGoogleMapsUrl(results.url);
            models.selectedPlace.setPhoneNum(results.formatted_phone_number);
            // This is needed to guard against items without opening_hours
            if (results.opening_hours) {
              models.selectedPlace.setOpenNow(results.opening_hours.open_now);
              models.selectedPlace.setHoursOpen(results.opening_hours.weekday_text);
            }
            console.log('requestPlaceDetails - End');
            resolve();
          } else {
            iews.alerts.error('Sorry, please try again.');
          }
        }
      });
    },
    // Requests subway distance info from Google Maps Distance Matrix.
    requestTransitDistance: function() {
      console.log('requestTransitDistance - Start');
      return new Promise(function(resolve, reject) {
        var service = new google.maps.DistanceMatrixService();
        var origin = new google.maps.LatLng(models.searchLocation.lat, models.searchLocation.lng);
        var destination = new google.maps.LatLng(models.selectedPlace.lat, models.selectedPlace.lng);
        var params = {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: { modes: [google.maps.TransitMode.SUBWAY] },
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        // Request the distance & pass to callback
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
            models.selectedPlace.setTransitInfo(distance, duration);
            console.log('requestTransitDistance - End');
            resolve();
          }
        }
      });
    },
    // Handle results for an individual place
    updateModal: function() {
      views.itemModal.populate();
      views.itemModal.show();
    },
    // Sets the location to be used by Google Places Search when a location is selected from Recent Places
    setSearchLocation: function(location) {
      models.searchLocation.setLat(location.lat);
      models.searchLocation.setLng(location.lng);
      models.searchLocation.setFormattedAddress(location.formattedAddress);
      models.searchLocation.setTotalItems(location.totalItems);
    }
  };

/* ===== VIEWS ===== */

  views = {
    page: {
      init: function() {
        // Initialize page settings
        var searchItemTypeCaps = '';
        var searchItemType = app.settings.search.itemType.split(/\s+/);
        for (var i=0; i < searchItemType.length; i++) {
          searchItemTypeCaps += ' ' + searchItemType[i].charAt(0).toUpperCase() + searchItemType[i].slice(1);
        }
        var pageTitle = searchItemTypeCaps + ' Finder';
        document.title = pageTitle;
        document.getElementById('heading').textContent = pageTitle;
      },
      clear: function() {
        views.alerts.clear();
        views.results.clear();
        views.moreResultsBtn.hide();
        views.moreResultsBtn.disable();
      },
      disableButtons: function() {
        views.form.disableSearchBtn();
        views.locationBtn.disable();
      },
      enableButtons: function() {
        window.setTimeout(function() {
          views.form.enableSearchBtn();
          views.locationBtn.enable();
        }, 250);
      }
    },
    map: {
      init: function() {
        // Collect DOM elements
        this.map = document.getElementById('map');
      }
    },
    form: {
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
            views.page.disableButtons();
            views.page.clear();
            controller.formSearch();
          }
        });
        this.searchBtn.addEventListener('click', function() {
          views.page.disableButtons();
          views.page.clear();
          controller.formSearch();
        });
      },
      setTboxPlaceholder: function() {
        this.cityStateTbox.value = null;
        this.cityStateTbox.setAttribute('placeholder', models.searchLocation.formattedAddress);
      },
      disableSearchBtn: function() {
        this.searchBtn.setAttribute('disabled', true);
      },
      enableSearchBtn: function() {
        this.searchBtn.removeAttribute('disabled');
      }
    },
    locationBtn: {
      init: function() {
        // Collect DOM elements
        this.locationBtn = document.getElementById('locationBtn');
        // Add click handlers
        this.locationBtn.addEventListener('click', function() {
          views.page.disableButtons();
          views.page.clear();
          controller.geolocationSearch();
        });
      },
      disable: function() {
        this.locationBtn.setAttribute('disabled', true);
      },
      enable: function() {
        this.locationBtn.removeAttribute('disabled');
      }
    },
    alerts: {
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
      error: function(msg) {
        this.alert.textContent = msg;
        this.alert.classList.add('alert-danger');
        this.alert.classList.remove('hidden');
      },
      info: function(msg) {
        this.alert.textContent = msg;
        this.alert.classList.add('alert-info');
        this.alert.classList.remove('hidden');
      },
      success: function(msg) {
        this.alert.textContent = msg;
        this.alert.classList.add('alert-success');
        this.alert.classList.remove('hidden');
      }
    },
    itemModal: {
      init: function() {
        this.itemModal = document.getElementById('itemModal');
        this.itemModalTitle = document.getElementById('itemModalTitle');
        this.itemModalOpenNow = document.getElementById('itemModalOpenNow');
        this.itemModalWebsite = document.getElementById('itemModalWebsite');
        this.itemModalAddress = document.getElementById('itemModalAddress');
        this.itemModalPhoneNum = document.getElementById('itemModalPhoneNum');
        this.itemModalDrivingInfo = document.getElementById('itemModalDrivingInfo');
        this.itemModalTransitInfo = document.getElementById('itemModalTransitInfo');
        this.itemModalHoursOpen = document.getElementById('itemModalHoursOpen');
      },
      populate: function() {
        var currentDay = new Date().getDay();
        // Adjust to start week on Monday for hoursOpen
        currentDay -= 1;
        // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
        currentDay = currentDay === -1 ? 6 : currentDay;
        this.itemModalTitle.textContent = models.selectedPlace.name;
        this.itemModalOpenNow.textContent = models.selectedPlace.openNow;
        this.itemModalWebsite.setAttribute('href', models.selectedPlace.website);
        this.itemModalWebsite.textContent = models.selectedPlace.website;
        this.itemModalAddress.setAttribute('href', models.selectedPlace.googleMapsUrl);
        this.itemModalAddress.textContent = models.selectedPlace.address;
        this.itemModalPhoneNum.setAttribute('href', 'tel:' + models.selectedPlace.phoneNum);
        this.itemModalPhoneNum.textContent = models.selectedPlace.phoneNum;

        if (models.selectedPlace.drivingInfo.duration || models.selectedPlace.drivingInfo.distance) {
          this.itemModalDrivingInfo.textContent = models.selectedPlace.drivingInfo.duration + ' (' + models.selectedPlace.drivingInfo.distance + ')';
        } else {
          this.itemModalDrivingInfo.textContent = 'No driving options';
        }
        if (models.selectedPlace.transitInfo.duration || models.selectedPlace.transitInfo.distance) {
          this.itemModalTransitInfo.textContent = models.selectedPlace.transitInfo.duration + ' (' + models.selectedPlace.transitInfo.distance + ')';
        } else {
          this.itemModalTransitInfo.textContent = 'No transit options';
        }

        this.itemModalHoursOpen.textContent = null;
        if (models.selectedPlace.hoursOpen) {
          for (var i=0; i < models.selectedPlace.hoursOpen.length; i++) {
            var li = document.createElement('li');
            // Split hoursOpen on ':'
            var dayTime = models.selectedPlace.hoursOpen[i].split(/:\s/);
            // <span> is needed to highlight hours for current day
            li.innerHTML = '<span><strong>' + dayTime[0] + ':</strong>' + dayTime[1] + '</span>';
            // Highlight current day of week
            if (i === currentDay) {
              li.classList.add('current-day');
            }
            this.itemModalHoursOpen.appendChild(li);
          }
        }
      },
      show: function() {
        $('#itemModal').modal('show');
      }
    },
    results: {
      init: function() {
        // Collect DOM elements
        this.resultsList = document.getElementById('resultsList');
      },
      clear: function() {
        this.resultsList.textContent = null;
      },
      render: function() {
        this.resultsList.textContent = null;
        this.resultsList.classList.remove('hidden');

        var results = models.places.get();

        if (results) {
          for (var i=0; i < results.length; i++) {
            var li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = results[i].name;

            var span = document.createElement('span');
            span.classList.add('badge');
            span.textContent = results[i].drivingInfo.distance;

            li.appendChild(span);

            li.addEventListener('click', (function(place) {
              return function() {
                controller.getDetails(place);
              };
            })(results[i]));

            this.resultsList.appendChild(li);
          }
        }
        // Select results tab and panel to show new results
        $('#resultsTab').tab('show');
      }
    },
    moreResultsBtn: {
      init: function() {
        // Collect DOM elements
        this.moreResultsBtn = document.getElementById('moreResultsBtn');
        // Set default values on DOM elements
        this.moreResultsBtn.classList.add('hidden');
        // Add click handlers
        this.moreResultsBtn.addEventListener('click', function() {
          views.page.disableButtons();
          views.page.clear();
          window.scroll(0, 0);
        });
      },
      addNextPageFn: function() {
        this.moreResultsBtn.onclick = function() {
          controller.requestMoreResults();
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
    },
    recentSearches: {
      init: function() {
        // Collect DOM elements
        this.recentSearchesList = document.getElementById('recentSearchesList');
        this.render();
      },
      render: function() {
        this.recentSearchesList.textContent = null;
        var recentSearches = models.recentSearches.get();

        if (recentSearches) {
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
                views.page.disableButtons();
                views.page.clear();
                controller.recentSearch(location);
              };
            })(recentSearches[i]));

            this.recentSearchesList.appendChild(li);
          }
        } else {
          var li = document.createElement('li');
          li.classList.add('list-group-item');
          li.classList.add('text-center');
          li.textContent = 'You have no recent searches.';
          this.recentSearchesList.appendChild(li);
        }
      }
    }
  };

  controller.init();

})();
