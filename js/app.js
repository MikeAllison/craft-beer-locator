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
      views.alerts.init();
    },
    getCurrentLocation: function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        model.setLatLng(position.coords.latitude, position.coords.longitude);
      });
    },
    getGeocode: function() {
      var tboxVal = views.form.cityStateTbox.value;
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?';
      var params = 'key=' + controller.apiKey + '&address=' + encodeURIComponent(tboxVal);

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
    }
  };

  views = {
    form: {
      init: function() {
        // Collect DOM elements
        this.cityStateTbox = document.getElementById('cityStateTbox');
        this.searchBtn = document.getElementById('searchBtn');
        this.geoLocationBtn = document.getElementById('geoLocationBtn');
        this.moreResultsBtn = document.getElementById('moreResultsBtn');
        // Set default values on DOM elements
        this.cityStateTbox.setAttribute('autofocus', true);
        this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
        this.moreResultsBtn.classList.add('hidden');
        // Add click handlers
        this.searchBtn.addEventListener('click', function() {
          controller.getGeocode();
        });
        this.geoLocationBtn.addEventListener('click', function(){
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
      tryAgain: function() {
        this.alertDiv.textContent = 'Sorry, please try again.';
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      },
      notFound: function() {
        this.alertDiv.textContent = 'Sorry, that location could not be found.';
        this.alertDiv.classList.add('alert-danger');
        this.alertDiv.classList.remove('hidden');
      }
    },
    results: {

    }
  };

  controller.init();

})();
