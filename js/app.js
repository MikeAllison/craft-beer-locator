(function(){
  var model, controller, views;

  model = {
    init: function() {
      this.currentLoc = 'Orlando, FL';
    }
  };

  controller = {
    init: function() {
      // Initialize Model
      model.init();
      // Initialize Views
      views.form.init();
    }
  };

  views = {
    form: {
      init: function() {
        this.cityStateTbox = document.getElementById('cityStateTbox');
        this.cityStateTbox.setAttribute('autofocus', true);
        this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
        this.searchBtn = document.getElementById('searchBtn');
        this.geoLocationBtn = document.getElementById('geoLocationBtn');
        this.moreResultsBtn = document.getElementById('moreResultsBtn');
        this.moreResultsBtn.classList.add('hidden');
      }
    },
    results: {

    }
  };

  controller.init();

})();
