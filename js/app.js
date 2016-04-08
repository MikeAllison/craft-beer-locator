(function(){
  var model, controller, views;

  model = {
    init: function() {
      this.currentLoc = { lat: null, lng: null };
    }
  };

  controller = {
    init: function() {
      model.init();
      views.form.init();
    },
    getCurrentLocation: function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        // Store this position
        console.log(position);
      });
    }
  };

  views = {
    form: {
      init: function() {
        // Store DOM elements
        this.cityStateTbox = document.getElementById('cityStateTbox');
        this.searchBtn = document.getElementById('searchBtn');
        this.geoLocationBtn = document.getElementById('geoLocationBtn');
        this.moreResultsBtn = document.getElementById('moreResultsBtn');
        // Set default values on DOM elements
        this.cityStateTbox.setAttribute('autofocus', true);
        this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
        this.moreResultsBtn.classList.add('hidden');
        // Add click handlers
        this.geoLocationBtn.addEventListener('click', function(){
          controller.getCurrentLocation();
        });
      }
    },
    results: {

    }
  };

  controller.init();

})();
