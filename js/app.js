(function(){
  var model, controller, views;

  model = {
    init: function() {
      this.location = {};
    },
    setLatLng: function(lat, lng) {
      this.location = { lat: lat, lng: lng };
    }
  };

  controller = {
    init: function() {
      this.apiKey = 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
      model.init();
      views.form.init();
      // TO-DO: DON'T SHOW CURRENT LOCATION BUTTON IF GEOLOCATION ISN't AVAILABLE
      views.locationBtn.init();
      views.alerts.init();
      views.results.init();
      views.moreResultsBtn.init();
    },
    getCurrentLocation: function() {
      views.alerts.clear();
      // HTML5 geocoding request for lat/lng for 'My Location' button

      // TO-DO:  HANDLE ERROR FOR GEOLOCATION TURNED OFF
      navigator.geolocation.getCurrentPosition(function(position) {
        model.setLatLng(position.coords.latitude, position.coords.longitude);
      });
    },
    getGeocode: function() {
      views.alerts.clear();

      var tboxVal = views.form.cityStateTbox.value;

      if (tboxVal) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?';
        var params = 'key=' + controller.apiKey + '&address=' + encodeURIComponent(tboxVal);

        // AJAX request for lat/lng for form submission
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          views.alerts.tryAgain();
          return false;
        }

        httpRequest.onload = function() {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status !== 200) {
              views.alerts.tryAgain();
              return;
            } else {
              var response = JSON.parse(httpRequest.responseText);

              if (response.status === 'ZERO_RESULTS' || response.results[0].geometry.bounds === undefined) {
                views.alerts.notFound();
                return;
              } else {
                model.setLatLng(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
              }
            }
          }
        };

        httpRequest.open('GET', url + params, true);
        httpRequest.send();
      } else {
        views.alerts.noLocation();
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
        var alertTypes = ['alert-danger', 'alert-info', 'alert-success'];
        for (var i = 0; i < alertTypes.length; i++) {
          this.alertDiv.classList.remove(alertTypes[i]);
        }
        this.alertDiv.textContent = null;
      },
      geolocationDisabled: function() {
        // TO-DO: REFACTOR
        this.alertDiv.textContent = 'Please allow this device to detect your location.';
        this.alertDiv.classList.add('alert-info');
        this.alertDiv.classList.remove('hidden');
      },
      noLocation: function() {
        // TO-DO: REFACTOR
        this.alertDiv.textContent = 'Please enter a location';
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      },
      tryAgain: function() {
        // TO-DO: REFACTOR
        this.alertDiv.textContent = 'Sorry, please try again.';
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      },
      notFound: function() {
        // TO-DO: REFACTOR
        this.alertDiv.textContent = 'Sorry, that location could not be found.';
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      }
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
