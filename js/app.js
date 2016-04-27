(function(){
  var app, model, controller, views;

/* ===== APP CONFIG SETTINGS ===== */

  app = {
    init: function() {
      // Set the type and radius of thing to search for (i.e. 'brewery' or 'craft beer')
      this.settings = {
        search: {
          // itemType - Can change: This can be set to anything that you'd like to search for
          itemType: 'brewery',
          // rankBy -  Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
          rankBy: google.maps.places.RankBy.DISTANCE,
          // radius - Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)
          radius: '25000',

          // SEARCH SORTING/FILTERING:
          // These settings will help narrow down to relevant results
          // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

          // primaryTypes - Any result having these types will be sorted and listed first (examples: [''], ['type1'], ['type1, 'type2'], etc.)
          primaryTypes: ['bar'],

          // secondaryTypes: Any result having these types will be listed after primaryTypes (examples: [''], ['type1'], ['type1, 'type2'], etc.)
          secondaryTypes: ['restaurant', 'food'],

          // excludedTypes: Any result having these types will excluded from the results (examples: [''], ['type1'], ['type1, 'type2'], etc.)
          excludedTypes: ['store'],

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
    location: {
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
      resetNewSearch: function() {
        this.newSearch = true;
      }
    },
    selectedItem: {
      init: function() {
        this.name = null;
        this.openNow = null;
        this.website = null;
        this.address = null;
        this.googleMapsUrl = null;
        this.phoneNum = null;
        this.hoursOpen = null;
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
      setHoursOpen: function(hoursOpen) {
        this.hoursOpen = hoursOpen ? hoursOpen : '';
      }
    },
    searchResults: {
      init: function() {
        sessionStorage.clear();
      },
      // Adds an array of results of search to sessionStorage
      add: function(items) {
        sessionStorage.setItem('searchResults', JSON.stringify(items));
      },
      // Retrieves an array of results of search from sessionStorage
      get: function() {
        return JSON.parse(sessionStorage.getItem('searchResults'));
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
        newSearch.lat = models.location.lat;
        newSearch.lng = models.location.lng;
        newSearch.formattedAddress = models.location.formattedAddress;
        newSearch.totalItems = models.location.totalItems;
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
      models.location.init();
      models.searchResults.init();
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
    // A-1:
    // Takes a city, state and converts it to lat/lng using Google Geocoding API
    // This could be performed using a Google Maps object but I wanted to practice using AJAX requests
    getGeocode: function() {
      var tboxVal = views.form.cityStateTbox.value;

      if (tboxVal) {
        // AJAX request for lat/lng for form submission
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          views.alerts.error('Sorry, please try again.');
          return false;
        }

        var params = 'key=' + app.google.apiKey + '&address=' + encodeURIComponent(tboxVal);
        httpRequest.open('GET', app.google.geocodingAPI.reqURL + params, true);
        httpRequest.send();

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status !== 200) {
              views.alerts.error('Sorry, please try again.');
              return;
            } else {
              var response = JSON.parse(httpRequest.responseText);

              if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
                views.alerts.error('Sorry, that location could not be found.');
                return;
              } else {
                models.location.setLat(response.results[0].geometry.location.lat);
                models.location.setLng(response.results[0].geometry.location.lng);
                models.location.setFormattedAddress(response.results[0].formatted_address);
                controller.requestPlaces();
              }
            }
          }
        };
      } else {
        views.alerts.error('Please enter a location.');
      }

      views.page.enableButtons();
    },
    // B-1:
    // HTML5 geocoding request for lat/lng for 'My Location' button
    getCurrentLocation: function() {
      var success = function(position) {
        models.location.setLat(position.coords.latitude);
        models.location.setLng(position.coords.longitude);
        controller.reverseGeocode();
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
    },
    // B-2:
    // Converts lat/lng to a city, state
    reverseGeocode: function() {
      var httpRequest = new XMLHttpRequest();
      var params = 'key=' + app.google.apiKey + '&latlng=' + models.location.lat + ',' + models.location.lng;

      httpRequest.open('GET', app.google.geocodingAPI.reqURL + params, true);
      httpRequest.send();

      httpRequest.onload = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          var response = JSON.parse(httpRequest.responseText);
          // Sets .formattedAddress as city, state (i.e. New York, NY)
          models.location.setFormattedAddress(response.results[0].address_components[2].long_name + ', ' + response.results[0].address_components[4].short_name);
          controller.requestPlaces();
        }
      };
    },
    // A-2/B-3:
    // Sends a lat/lng to Google Places Library and stores results
    requestPlaces: function() {
      // Reset first request so search location is added to Recent Searches
      models.location.resetNewSearch();
      // Set params for search
      var location = new google.maps.LatLng(models.location.lat, models.location.lng);
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
          // Get distance info on each result
          controller.requestDrivingDistance(results, pagination);
          controller.requestTransitDistance(results, pagination);
          // Send to sorting function
          controller.sortResults(results, pagination);
        } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          models.searchResults.init();
          views.alerts.info('Your request returned no results.');
          views.results.render();
        } else {
          models.searchResults.init();
          views.alerts.error('Sorry, please try again.');
          views.results.render();
        }
      }
    },
    // A-3a/B-4a:
    // Requests driving distance info from Google Maps Distance Matrix.
    requestDrivingDistance: function(results, pagination) {
      var service = new google.maps.DistanceMatrixService();
      var origin = new google.maps.LatLng(models.location.lat, models.location.lng);

      for (var id in results) {
        // params must be reset before each request
        var params = {
          origins: [origin],
          destinations: [],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        // Closure needed for AJAX to assign response to correct places object
        (function(result) {
          // Set the destination
          var destination = new google.maps.LatLng(results[id].geometry.location.lat(), results[id].geometry.location.lng());
          params.destinations.push(destination);

          // Request the distance for driving & callback
          service.getDistanceMatrix(params, callback);

          function callback(results, status) {
            if (status == google.maps.DistanceMatrixStatus.OK) {
              // Guard against no driving options to destination
              if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
                // Add distance info to each result
                result.drivingInfo = {
                  distance: results.rows[0].elements[0].distance.text,
                  duration: results.rows[0].elements[0].duration.text
                };
              }
            }
          }
        })(results[id]);
      }
    },
    // A-3b/B-4b:
    // Requests subway distance info from Google Maps Distance Matrix.
    requestTransitDistance: function(results, pagination) {
      var service = new google.maps.DistanceMatrixService();
      var origin = new google.maps.LatLng(models.location.lat, models.location.lng);

      for (var id in results) {
        // params must be reset before each request
        var params = {
          origins: [origin],
          destinations: [],
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: { modes: [google.maps.TransitMode.SUBWAY] },
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        // Closure needed for AJAX to assign response to correct places object
        (function(result) {
          // Set the destination
          var destination = new google.maps.LatLng(results[id].geometry.location.lat(), results[id].geometry.location.lng());
          params.destinations.push(destination);

          // Request the distance for driving & callback
          service.getDistanceMatrix(params, callback);

          function callback(results, status) {
            if (status == google.maps.DistanceMatrixStatus.OK) {
              // Guard against no transit option to destination
              if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
                // Add distance info to each result
                result.transitInfo = {
                  distance: results.rows[0].elements[0].distance.text,
                  duration: results.rows[0].elements[0].duration.text
                };
              }
            }
          }
        })(results[id]);
      }
    },
    // A-4/B-5:
    // Handles processing of places returned from Google.
    sortResults: function(results, pagination) {
      var primaryTypes = app.settings.search.primaryTypes;
      var secondaryTypes = app.settings.search.secondaryTypes;
      var excludedTypes = app.settings.search.excludedTypes;
      var primaryResults = [];
      var secondaryResults = [];
      var sortedResults = [];

      // Sorts results based on relevent/exlcuded categories in app.settings.search
      for (var id in results) {
        var hasSecondaryType = false;
        var hasExcludedType = false;

        // Check for primary types and push onto array for primary results
        for (var i=0; i < primaryTypes.length; i++) {
          if (results[id].types.includes(primaryTypes[i])) {
            hasPrimaryType = true;
            primaryResults.push(results[id]);
          }
        }

        // If the primary array doesn't contain the result, check for secondary types...
        // ...but make sure that it doesn't have a type on the excluded list
        if (!primaryResults.includes(results[id])) {
          for (var j=0; j < secondaryTypes.length; j++) {
            if (results[id].types.includes(secondaryTypes[j])) {
              hasSecondaryType = true;
              for (var k=0; k < excludedTypes.length; k++) {
                if(results[id].types.includes(excludedTypes[k])) {
                  hasExcludedType = true;
                }
              }
            }
          }
          // Push onto array for secondary results if it has a secondary (without excluded) type
          if (hasSecondaryType && !hasExcludedType) {
            secondaryResults.push(results[id]);
          }
        }
      }

      // Combine primary and secondary arrays
      sortedResults = primaryResults.concat(secondaryResults);

      if (sortedResults.length > 0) {
        // Adds search results to sessionStorage
        models.searchResults.add(sortedResults);
        // Update page and pass pagination object for > 20 results
        controller.updatePage(pagination);
      } else {
        models.searchResults.init();
        views.alerts.info('Your request returned no results.');
        views.results.render();
      }
    },
    // A-5/B-6:
    // Updates results on page
    updatePage: function(paginationObj) {
      var sortedResults = models.searchResults.get();

      if (sortedResults) {
        // Only set location attributes and it to recent searches if it's the first request of the location
        if (models.location.newSearch) {
          var totalItems = sortedResults.length;

          models.location.setTotalItems(paginationObj.hasNextPage ? totalItems + '+' : totalItems);
          models.recentSearches.add();

          // Set message for alert (first request of location only)
          var msg = (!app.settings.search.topResultsOnly && paginationObj.hasNextPage) ? 'More than ' : '';
          views.alerts.success(msg + totalItems + ' matches! Click on an item for more details.');
        }

        // Handle > 20 matches (Google returns a max of 20 by default)
        if (!app.settings.search.topResultsOnly && paginationObj.hasNextPage) {
          // Prevent addition of locations to recent searches if more button is pressed
          models.location.newSearch = false;
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
      views.page.enableButtons();
    },
    // A-5-1/B-6-1:
    // This requests details of the selectedItem
    reqestPlaceDetails: function(location) {
      var request = { placeId: location.place_id };

      service = new google.maps.places.PlacesService(views.map.map);
      service.getDetails(request, this.processPlaceResults);
    },
    // A-5-2/B-6-2:
    // Handle results for an individual place
    processPlaceResults: function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        controller.setCurrentItem(results);
        views.itemModal.populate();
        views.itemModal.show();
      } else {
        views.alerts.error('Sorry, please try again.');
      }
    },
    // A-5-3/B-6-3:
    // Sets the current item for viewing details about it
    setCurrentItem: function(item) {
      models.selectedItem.init();
      models.selectedItem.setName(item.name);
      models.selectedItem.setWebsite(item.website);
      models.selectedItem.setAddress(item.formatted_address);
      models.selectedItem.setGoogleMapsUrl(item.url);
      models.selectedItem.setPhoneNum(item.formatted_phone_number);
      // This is needed to guard against items without opening_hours
      if (item.opening_hours) {
        models.selectedItem.setOpenNow(item.opening_hours.open_now);
        models.selectedItem.setHoursOpen(item.opening_hours.weekday_text);
      }
    },
    // Sets the location to be used by Google Places Search
    // Called when a loction is clicked in Recent Searches
    setLocation: function(location) {
      models.location.setLat(location.lat);
      models.location.setLng(location.lng);
      models.location.setFormattedAddress(location.formattedAddress);
      models.location.setTotalItems(location.totalItems);
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
            controller.getGeocode();
          }
        });
        this.searchBtn.addEventListener('click', function() {
          views.page.disableButtons();
          views.page.clear();
          controller.getGeocode();
        });
      },
      setTboxPlaceholder: function() {
        this.cityStateTbox.value = null;
        this.cityStateTbox.setAttribute('placeholder', models.location.formattedAddress);
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
          controller.getCurrentLocation();
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
        this.itemModalHoursOpen = document.getElementById('itemModalHoursOpen');
      },
      populate: function() {
        var currentDay = new Date().getDay();
        // Adjust to start week on Monday for hoursOpen
        currentDay -= 1;
        this.itemModalTitle.textContent = models.selectedItem.name;
        this.itemModalOpenNow.textContent = models.selectedItem.openNow;
        this.itemModalWebsite.setAttribute('href', models.selectedItem.website);
        this.itemModalWebsite.textContent = models.selectedItem.website;
        this.itemModalAddress.setAttribute('href', models.selectedItem.googleMapsUrl);
        this.itemModalAddress.textContent = models.selectedItem.address;
        this.itemModalPhoneNum.setAttribute('href', 'tel:' + models.selectedItem.phoneNum);
        this.itemModalPhoneNum.textContent = models.selectedItem.phoneNum;

        this.itemModalHoursOpen.textContent = null;
        if (models.selectedItem.hoursOpen) {
          for (var i=0; i < models.selectedItem.hoursOpen.length; i++) {
            var li = document.createElement('li');
            // Split hoursOpen on ':'
            var dayTime = models.selectedItem.hoursOpen[i].split(/:\s/);
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

        var results = models.searchResults.get();

        if (results) {
          for (var i=0; i < results.length; i++) {
            var li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = results[i].name;

            li.addEventListener('click', (function(location) {
              return function() {
                controller.reqestPlaceDetails(location);
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
      addNextPageFn: function(obj) {
        this.moreResultsBtn.onclick = function() {
          obj.nextPage();
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
                controller.setLocation(location);
                controller.requestPlaces();
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
