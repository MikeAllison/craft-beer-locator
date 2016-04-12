(function(){
  var app, model, controller, views;

  app = {
    init: function() {
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
      },
      setLat: function(lat) {
        this.lat = lat;
      },
      setLng: function(lng) {
        this.lng = lng;
      }
    },
    brewery: {
      init: function() {
      }
    }
  };

  controller = {
    init: function() {
      app.init();
      models.location.init();
      models.brewery.init();
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
              }
            }
          }
        };
      } else {
        views.alerts.error('Please enter a location');
      }
    }
  };

  views = {
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
        var alertTypes = ['alert-error', 'alert-info', 'alert-success'];
        for (var i = 0; i < alertTypes.length; i++) {
          this.alertDiv.classList.remove(alertTypes[i]);
        }
        this.alertDiv.textContent = null;
      },
      error: function(msg) {
        this.alertDiv.textContent = msg;
        this.alertDiv.classList.add('alert-error');
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
