(function(){
  var app, model, controller, views;

/* ===== APP CONFIG SETTINGS ===== */

  app = {
    init: function() {
      // Set the type and radius of thing to search for
      this.settings = {
        search: {
          itemName: 'brewery',
          // This is either: google.maps.places.RankBy.PROMINENCE or google.maps.places.RankBy.DISTANCE
          // If using google.maps.places.RankBy.PROMINENCE, a radius must be set
          rankBy: google.maps.places.RankBy.DISTANCE,
          radius: '25000',
          // This must be matched in controller.requestPlaces()
          topCategories: ['bar', 'restaurant', 'food'],
          excludedCategories: ['store']
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
    searchItems: {
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
      // TO-DO: May need to refactor some of this to remove things that aren't needed
      app.init();
      models.location.init();
      models.searchItems.init();
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
    setLocation: function(location) {
      models.location.setLat(location.lat);
      models.location.setLng(location.lng);
      models.location.setFormattedAddress(location.formattedAddress);
      models.location.setTotalItems(location.totalItems);
    },
    // HTML5 geocoding request for lat/lng for 'My Location' button
    getCurrentLocation: function() {
      views.alerts.clear();
      views.results.clear();

      var success = function(position) {
          models.location.setLat(position.coords.latitude);
          models.location.setLng(position.coords.longitude);
          controller.reverseGeocode();
          controller.requestPlaces();
      };
      // TO-DO: Handle error
      var error = function() {};
      var options = { enableHighAccuracy: true };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(success, error, options);
      } else {
        views.alerts.error('Sorry, geolocation is not supported in your browser.');
      }
    },
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
        }
      };
    },
    // Takes a city, state and converts it to lat/lng using Google Geocoding API
    // This could be performed using a Google Maps object but I wanted to practice using AJAX requests
    getGeocode: function() {
      views.alerts.clear();
      views.results.clear();

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
    },
    // Sends a lat/lng to Google Places Library and stores results
    requestPlaces: function() {
      // Set params for search
      var location = new google.maps.LatLng(models.location.lat, models.location.lng);
      var request = {
        location: location,
        rankBy: app.settings.search.rankBy,
        keyword: app.settings.search.itemName
      };

      // Radius is required on request if ranked by PROMINENCE
      if (request.rankBy === google.maps.places.RankBy.PROMINENCE) {
        request.radius = app.settings.search.radius;
      }

      // Google map isn't shown on page but is required for PlacesService constructor
      var service = new google.maps.places.PlacesService(views.map.map);
      service.nearbySearch(request, processResults);

      function processResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var sortedResults = [];

          // Sorts results based on relevance
          // This could be refactored so that it doesn't need to be changed if number of categories changes
          for (var resultId in results) {
            if (results[resultId].types.includes(app.settings.search.topCategories[0])) {
              sortedResults.push(results[resultId]);
            } else if (results[resultId].types.includes(app.settings.search.topCategories[1])) {
              sortedResults.push(results[resultId]);
            } else if (results[resultId].types.includes(app.settings.search.topCategories[2]) && !results[resultId].types.includes(app.settings.search.excludedCategories[0])) {
              sortedResults.push(results[resultId]);
            }
          }

          // Adds search results to sessionStorage
          models.searchItems.add(sortedResults);
          models.location.setTotalItems(sortedResults.length);
          // Adds last search to localStorage
          models.recentSearches.add();
          // TO-DO: Change message if > 20 matches
          views.alerts.success(sortedResults.length + ' matches! Click on an item for more details.');
          views.recentSearches.render();
          views.results.render();
        } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          views.alerts.info('Your request returned no results.');
        } else {
          views.alerts.error('Sorry, please try again.');
        }
      }
    },
    // This requests details of the selectedItem
    reqestPlaceDetails: function(location) {
      var request = { placeId: location.place_id };

      service = new google.maps.places.PlacesService(views.map.map);
      service.getDetails(request, processResults);

      function processResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          controller.setCurrentItem(results);
          views.itemModal.populate();
          views.itemModal.show();
        } else {
          views.alerts.error('Sorry, please try again.');
        }
      }
    }
  };

/* ===== VIEWS ===== */

  views = {
    page: {
      init: function() {
        // Initialize page settings
        var searchItemsName = app.settings.search.itemName;
        var pageTitle = searchItemsName.charAt(0).toUpperCase() + searchItemsName.slice(1) + ' Finder';
        document.title = pageTitle;
        document.getElementById('heading').textContent = pageTitle;
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
        this.cityStateTbox.addEventListener('keyup', function(e) {
          if (e.keyCode === 13) {
            // TO-DO: Disable buttons until results (or alerts) are returned
            controller.getGeocode();
          }
        });
        this.searchBtn.addEventListener('click', function() {
          // TO-DO: Disable buttons until results (or alerts) are returned
          controller.getGeocode();
        });
      }
    },
    locationBtn: {
      init: function() {
        // Collect DOM elements
        this.locationBtn = document.getElementById('locationBtn');
        // Add click handlers
        this.locationBtn.addEventListener('click', function() {
          // TO-DO: Disable buttons until results (or alerts) are returned
          controller.getCurrentLocation();
        });
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

        var searchItems = models.searchItems.get();

        if (searchItems) {
          for (var i=0; i < searchItems.length; i++) {
            var li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = searchItems[i].name;

            li.addEventListener('click', (function(location) {
              return function() {
                controller.reqestPlaceDetails(location);
              };
            })(searchItems[i]));

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
                controller.setLocation(location);
                controller.requestPlaces();
              };
            })(recentSearches[i]));

            this.recentSearchesList.appendChild(li);
          }
        } else {
          var li = document.createElement('li');
          li.classList.add('list-group-item');
          li.textContent = 'You have no recent searches.';
          this.recentSearchesList.appendChild(li);
        }
      }
    }
  };

  controller.init();

})();
