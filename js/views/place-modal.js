var app = app || {};

(function() {

  app.views = app.views || {};

  // Modal that displays details when selecting a place
  app.views.placeModal = {
    init: function() {
      this.placeModal = document.getElementById('placeModal');
      this.placeModalTitle = document.getElementById('placeModalTitle');
      this.placeModalOpenNow = document.getElementById('placeModalOpenNow');
      this.placeModalWebsite = document.getElementById('placeModalWebsite');
      this.placeModalAddress = document.getElementById('placeModalAddress');
      this.placeModalPhoneNum = document.getElementById('placeModalPhoneNum');
      this.placeModalDrivingInfo = document.getElementById('placeModalDrivingInfo');
      this.placeModalDistanceWarning = document.getElementById('placeModalDistanceWarning');
      this.placeModalTransitInfo = document.getElementById('placeModalTransitInfo');
      this.placeModalHoursOpen = document.getElementById('placeModalHoursOpen');
      // Set defaults
      this.placeModalDistanceWarning.classList.add('hidden');
    },
    populate: function() {
      var currentDay = new Date().getDay();
      // Adjust to start week on Monday for hoursOpen
      currentDay -= 1;
      // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
      currentDay = currentDay === -1 ? 6 : currentDay;
      this.placeModalTitle.textContent = app.models.selectedPlace.name;
      this.placeModalOpenNow.textContent = app.models.selectedPlace.openNow;
      this.placeModalWebsite.setAttribute('href', app.models.selectedPlace.website);
      this.placeModalWebsite.textContent = app.models.selectedPlace.website;
      this.placeModalAddress.setAttribute('href', app.models.selectedPlace.googleMapsUrl);
      this.placeModalAddress.textContent = app.models.selectedPlace.address;
      this.placeModalPhoneNum.setAttribute('href', 'tel:' + app.models.selectedPlace.phoneNum);
      this.placeModalPhoneNum.textContent = app.models.selectedPlace.phoneNum;

      this.placeModalDistanceWarning.addEventListener('mouseover', function() {
        this.classList.add('hovered');
      });

      this.placeModalDistanceWarning.addEventListener('mouseout', function() {
        this.classList.remove('hovered');
        this.classList.remove('clicked');
      });

      this.placeModalDistanceWarning.addEventListener('click', function() {
        this.classList.add('clicked');
        app.controllers.switchToGeolocation();
        this.classList.add('hidden');
      });
      // Only show message if geolocation search isn't being used
      if (!app.models.userLoc.lat && !app.models.userLoc.lng) {
        this.placeModalDistanceWarning.classList.remove('hidden');
      }

      if (app.models.selectedPlace.drivingInfo.duration || app.models.selectedPlace.drivingInfo.distance) {
        this.placeModalDrivingInfo.textContent = app.models.selectedPlace.drivingInfo.duration + ' (' + app.models.selectedPlace.drivingInfo.distance + ')';
      } else {
        this.placeModalDrivingInfo.textContent = 'No driving options';
      }
      if (app.models.selectedPlace.transitInfo.duration || app.models.selectedPlace.transitInfo.distance) {
        this.placeModalTransitInfo.textContent = app.models.selectedPlace.transitInfo.duration + ' (' + app.models.selectedPlace.transitInfo.distance + ')';
      } else {
        this.placeModalTransitInfo.textContent = 'No transit options';
      }

      this.placeModalHoursOpen.textContent = null;
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
          this.placeModalHoursOpen.appendChild(li);
        }
      }
    },
    show: function() {
      $('#placeModal').modal('show');
    },
    hide: function() {
      $('#placeModal').modal('hide');
    }
  };

})();
