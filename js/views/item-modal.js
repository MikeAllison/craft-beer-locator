var app = app || {};

(function() {

  app.views = app.views || {};

  // Modal that displays details when selecting a place
  app.views.itemModal = {
    init: function() {
      this.itemModal = document.getElementById('itemModal');
      this.itemModalTitle = document.getElementById('itemModalTitle');
      this.itemModalOpenNow = document.getElementById('itemModalOpenNow');
      this.itemModalWebsite = document.getElementById('itemModalWebsite');
      this.itemModalAddress = document.getElementById('itemModalAddress');
      this.itemModalPhoneNum = document.getElementById('itemModalPhoneNum');
      this.itemModalDrivingInfo = document.getElementById('itemModalDrivingInfo');
      this.itemModalDistanceWarning = document.getElementById('itemModalDistanceWarning');
      this.itemModalTransitInfo = document.getElementById('itemModalTransitInfo');
      this.itemModalHoursOpen = document.getElementById('itemModalHoursOpen');
      // Set defaults
      this.itemModalDistanceWarning.classList.add('hidden');
    },
    populate: function() {
      var currentDay = new Date().getDay();
      // Adjust to start week on Monday for hoursOpen
      currentDay -= 1;
      // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
      currentDay = currentDay === -1 ? 6 : currentDay;
      this.itemModalTitle.textContent = app.models.selectedPlace.name;
      this.itemModalOpenNow.textContent = app.models.selectedPlace.openNow;
      this.itemModalWebsite.setAttribute('href', app.models.selectedPlace.website);
      this.itemModalWebsite.textContent = app.models.selectedPlace.website;
      this.itemModalAddress.setAttribute('href', app.models.selectedPlace.googleMapsUrl);
      this.itemModalAddress.textContent = app.models.selectedPlace.address;
      this.itemModalPhoneNum.setAttribute('href', 'tel:' + app.models.selectedPlace.phoneNum);
      this.itemModalPhoneNum.textContent = app.models.selectedPlace.phoneNum;

      this.itemModalDistanceWarning.addEventListener('click', function() {
        app.controllers.switchToGeolocation();
        this.classList.add('hidden');
      });
      // Only show message if geolocation search isn't being used
      if (!app.models.userLocation.lat && !app.models.userLocation.lng) {
        this.itemModalDistanceWarning.classList.remove('hidden');
      }

      if (app.models.selectedPlace.drivingInfo.duration || app.models.selectedPlace.drivingInfo.distance) {
        this.itemModalDrivingInfo.textContent = app.models.selectedPlace.drivingInfo.duration + ' (' + app.models.selectedPlace.drivingInfo.distance + ')';
      } else {
        this.itemModalDrivingInfo.textContent = 'No driving options';
      }
      if (app.models.selectedPlace.transitInfo.duration || app.models.selectedPlace.transitInfo.distance) {
        this.itemModalTransitInfo.textContent = app.models.selectedPlace.transitInfo.duration + ' (' + app.models.selectedPlace.transitInfo.distance + ')';
      } else {
        this.itemModalTransitInfo.textContent = 'No transit options';
      }

      this.itemModalHoursOpen.textContent = null;
      if (app.models.selectedPlace.hoursOpen) {
        for (var i=0; i < app.models.selectedPlace.hoursOpen.length; i++) {
          var li = document.createElement('li');
          // Split hoursOpen on ':'
          var dayTime = app.models.selectedPlace.hoursOpen[i].split(/:\s/);
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
  };

})();
