(function(){
  var app, model, controller, views;

  app = {
    init: function() {
      // Set the type and radius of thing to search for
      this.settings = {
        search: {
          itemName: 'brewery',
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

  models = {
    location: {
      init: function() {
        this.lat = null;
        this.lng = null;
        this.formattedAddress = null;
      },
      setLat: function(lat) {
        this.lat = lat;
      },
      setLng: function(lng) {
        this.lng = lng;
      },
      setFormattedAddress: function(address) {
        this.formattedAddress = address;
      }
    },
    searchItem: {
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

        if (cachedSearches === null) {
          cachedSearches = [];
        } else if (cachedSearches.length >= 5) {
          cachedSearches.pop();
        }

        cachedSearches.unshift(models.location.formattedAddress);

        localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
      },
      get: function() {
        return JSON.parse(localStorage.getItem('recentSearches'));
      }
    }
  };

  controller = {
    init: function() {
      app.init();
      models.location.init();
      models.searchItem.init();
      views.page.init();
      views.map.init();
      views.form.init();
      views.locationBtn.init();
      views.alerts.init();
      views.results.init();
      views.moreResultsBtn.init();
    },
    getCurrentLocation: function() {
      views.alerts.clear();
      // HTML5 geocoding request for lat/lng for 'My Location' button
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          models.location.setLat(position.coords.latitude);
          models.location.setLng(position.coords.longitude);
          // TO-DO: Convert lat/lng to city, state and save to models.location.name
          console.log(position);
          controller.requestPlaces();
        });
      } else {
        views.alerts.error('Sorry, geolocation is supported in your browser.');
      }
    },
    getGeocode: function() {
      views.alerts.clear();

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
        views.alerts.error('Please enter a location');
      }
    },
    requestPlaces: function() {
      // Set params for search
      var location = new google.maps.LatLng(models.location.lat, models.location.lng);
      var request = {
        location: location,
        radius: app.settings.search.radius,
        keyword: app.settings.search.itemName
      };

      // mapDiv isn't shown on page but is required for PlacesService constructor
      var service = new google.maps.places.PlacesService(views.map.mapDiv);
      service.nearbySearch(request, processResults);

      function processResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var sortedResults = [];

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

          // Store search results in sessionStorage
          models.searchItem.add(sortedResults);
          // Add search result to localStorage
          models.recentSearches.add();

          // TO-DO: Update recent searches list
          // TO-DO: Call method to render view
        } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          views.alerts.info('Your request returned no results');
        } else {
          views.alerts.error('Sorry, please try again.');
        }
      }
    }
  };

  views = {
    page: {
      init: function() {
        // Initialize page settings
        var searchItemName = app.settings.search.itemName;
        var pageTitle = searchItemName.charAt(0).toUpperCase() + searchItemName.slice(1) + ' Finder';
        document.title = pageTitle;
        document.getElementById('heading').textContent = pageTitle;
      }
    },
    map: {
      init: function() {
        // Collect DOM elements
        this.mapDiv = document.getElementById('mapDiv');
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
        this.searchBtn.addEventListener('click', function() {
          controller.getGeocode();
        });
      }
    },
    locationBtn: {
      init: function() {
        // Collect DOM elements
        this.locationBtn = document.getElementById('locationBtn');
        // Add click handlers
        this.locationBtn.addEventListener('click', function(){
          controller.getCurrentLocation();
        });
      }
    },
    alerts: {
      init: function() {
        // Collect DOM elements
        this.alertDiv = document.getElementById('alertDiv');
        // Set default values on DOM elements
        this.alertDiv.classList.add('hidden');
      },
      clear: function() {
        this.alertDiv = document.getElementById('alertDiv');
        this.alertDiv.classList.add('hidden');
        var alertTypes = ['alert-danger', 'alert-info', 'alert-success'];
        for (var i = 0; i < alertTypes.length; i++) {
          this.alertDiv.classList.remove(alertTypes[i]);
        }
        this.alertDiv.textContent = null;
      },
      error: function(msg) {
        this.alertDiv.textContent = msg;
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      },
      info: function(msg) {
        this.alertDiv.textContent = msg;
        this.alertDiv.classList.add('alert-info');
        this.alertDiv.classList.remove('hidden');
      },
    },
    results: {
      init: function() {
        // Collect DOM elements
        this.resultsDiv = document.getElementById('resultsDiv');
        // Set default values on DOM elements
        this.resultsDiv.classList.add('hidden');
      }
    },
    moreResultsBtn: {
      init: function() {
        // Collect DOM elements
        this.moreResultsBtn = document.getElementById('moreResultsBtn');
        // Set default values on DOM elements
        this.moreResultsBtn.classList.add('hidden');
      }
    }
  };

  controller.init();

})();
