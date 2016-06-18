/************************************
  Code for the modal of progress bar
*************************************/

(function() {

  app.views = app.views || {};

  // Progress Bar
  app.views.resultsProgressSection = {
    init: function() {
      // Collect DOM elements
      this.resultsProgressSection = document.getElementById('resultsProgressSection');
      this.resultsProgressStatus = document.getElementById('resultsProgressStatus');
      this.resultsProgressBar = document.getElementById('resultsProgressBar');
      // Set default values
      this.progressValue = 0;
      this.message = '';
      this.resultsProgressBar.setAttribute('aria-valuenow', '0');
      this.resultsProgressBar.setAttribute('aria-valuemin', '0');
      this.resultsProgressBar.setAttribute('aria-valuemax', '100');
      this.resultsProgressBar.setAttribute('style', 'min-width: 2em; width: 0');
    },
    start: function(message) {
      $('#loadingModal').modal('show');

      this.progressValue = 1;
      this.message = message;

      this.resultsProgressStatus.textContent = app.views.resultsProgressSection.message;

      var updateProgress = window.setInterval(function() {
        if (app.views.resultsProgressSection.progressValue >= 100 || app.views.resultsProgressSection.progressValue === 0) {
          $('#loadingModal').modal('hide');
          app.views.resultsProgressSection.init();
          window.clearInterval(updateProgress);
        }

        this.resultsProgressStatus.textContent = app.views.resultsProgressSection.message;
        this.resultsProgressBar.setAttribute('aria-valuenow', app.views.resultsProgressSection.progressValue);
        this.resultsProgressBar.setAttribute('style', 'min-width: 2em; width: ' + app.views.resultsProgressSection.progressValue + '%');
        this.resultsProgressBar.children[0].textContent = app.views.resultsProgressSection.progressValue + '%';
        app.views.resultsProgressSection.progressValue += 1;
      }, 333);
    },
    update: function(progressValue, message) {
      if (this.progressValue > progressValue) {
        return;
      }
      this.progressValue = progressValue;
      this.message = message;
    }
  };

})();
