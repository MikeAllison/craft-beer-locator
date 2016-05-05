var app = app || {};

(function() {

  app.views = app.views || {};

  // Page alerts
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
  };

})();
