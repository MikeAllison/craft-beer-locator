/************************************
  Code for the modal of progress bar
*************************************/

(function() {

  app.views = app.views || {};

  // Progress Modal
  app.views.progressModal = {
    init: function() {
      // Collect DOM elements
      this.progressStatus = document.getElementById('progressStatus');
      this.progressBar = document.getElementById('progressBar');
      // Set default values
      this.progressValue = 0;
      this.message = '';
      this.progressBar.children[0].textContent = "0%";
      this.progressBar.setAttribute('aria-valuenow', '0');
      this.progressBar.setAttribute('aria-valuemin', '0');
      this.progressBar.setAttribute('aria-valuemax', '100');
      this.progressBar.setAttribute('style', 'min-width: 2em; width: 0');
    },
    start: function(message) {
      $('#progressModal').modal('show');

      this.progressValue = 1;
      this.message = message;

      this.progressStatus.textContent = app.views.progressModal.message;

      var updateProgress = window.setInterval(function() {
        if (app.views.progressModal.progressValue >= 100 || app.views.progressModal.progressValue === 0) {
          $('#progressModal').modal('hide');
          $('#progressModal').on('hidden.bs.modal', function() {
            app.views.progressModal.init();
          });
          window.clearInterval(updateProgress);
        }
        this.progressStatus.textContent = app.views.progressModal.message;
        this.progressBar.setAttribute('aria-valuenow', app.views.progressModal.progressValue);
        this.progressBar.setAttribute('style', 'min-width: 2em; width: ' + app.views.progressModal.progressValue + '%');
        this.progressBar.children[0].textContent = app.views.progressModal.progressValue + '%';
        app.views.progressModal.progressValue += 1;
      }, 333);
    },
    update: function(progressValue, message) {
      this.message = message;
      if (this.progressValue > progressValue) {
        return;
      }
      this.progressValue = progressValue;
    }
  };

})();
