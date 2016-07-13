/****************************************
  Code for the modal of a selected place
*****************************************/

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
      // Set default values
      this.placeModalDistanceWarning.classList.add('hidden');
      this.placeModalDistanceWarning.innerHTML = 'These transit times reflect ' +
        'the distance from the city in your search.<br>Click this message to ' +
        'update the search results to show transit times from your current location.';
    },
    populate: function(selectedPlace) {
      // Reset hidden fields on each render
      var sections = document.getElementById('placeModalBody').children;
      for (var i = 0, length = sections.length; i < length; i++) {
        sections[i].classList.remove('hidden');
      }

      var currentDay = new Date().getDay();
      // Adjust to start week on Monday for hoursOpen
      currentDay -= 1;
      // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
      currentDay = currentDay === -1 ? 6 : currentDay;
      this.placeModalTitle.textContent = selectedPlace.name;

      if (selectedPlace.openNow) {
        this.placeModalOpenNow.textContent = selectedPlace.openNow;
      } else {
        this.placeModalOpenNow.parentElement.classList.add('hidden');
      }

      if (selectedPlace.website) {
        this.placeModalWebsite.setAttribute('href', selectedPlace.website);
        this.placeModalWebsite.textContent = selectedPlace.website;
      } else {
        this.placeModalWebsite.parentElement.classList.add('hidden');
      }

      if (selectedPlace.address) {
        this.placeModalAddress.setAttribute('href', selectedPlace.googleMapsUrl);
        this.placeModalAddress.textContent = selectedPlace.address;
      } else {
        this.placeModalAddress.parentElement.classList.add('hidden');
      }

      if (selectedPlace.phoneNum) {
        this.placeModalPhoneNum.setAttribute('href', 'tel:' + selectedPlace.phoneNum);
        this.placeModalPhoneNum.textContent = selectedPlace.phoneNum;
      } else {
        this.placeModalPhoneNum.parentElement.classList.add('hidden');
      }

      // Only show message if geolocation search isn't being used
      if (app.models.searchLoc.isGeoSearch) {
        this.placeModalDistanceWarning.classList.add('hidden');
      }

      this.placeModalDistanceWarning.addEventListener('mouseover', function() {
        this.classList.add('hovered');
      });

      this.placeModalDistanceWarning.addEventListener('mouseout', function() {
        this.classList.remove('hovered');
        this.classList.remove('clicked');
      });

      this.placeModalDistanceWarning.addEventListener('click', function() {
        this.classList.add('clicked');
        this.textContent = 'Updating...';

        app.controllers.switchToGeolocation();
      });

      if (selectedPlace.drivingInfo.duration || selectedPlace.drivingInfo.distance) {
        this.placeModalDrivingInfo.textContent = selectedPlace.drivingInfo.duration + ' (' + selectedPlace.drivingInfo.distance + ')';
      } else {
        this.placeModalDrivingInfo.textContent = 'No driving options';
      }
      if (selectedPlace.transitInfo.duration || selectedPlace.transitInfo.distance) {
        this.placeModalTransitInfo.textContent = selectedPlace.transitInfo.duration + ' (' + selectedPlace.transitInfo.distance + ')';
      } else {
        this.placeModalTransitInfo.textContent = 'No transit options';
      }

      this.placeModalHoursOpen.textContent = null;
      var hoursOpenFragment = document.createDocumentFragment(),
          li = document.createElement('li');

      if (selectedPlace.hoursOpen) {
        for (var j = 0, hrsLength = selectedPlace.hoursOpen.length; j < hrsLength; j++) {
          // Split hoursOpen on ':'
          var dayTime = selectedPlace.hoursOpen[j].split(/:\s/);
          // <span> is needed to highlight hours for current day
          li.innerHTML = '<span><strong>' + dayTime[0] + ':</strong>' + dayTime[1] + '</span>';
          // Highlight current day of week
          if (j === currentDay) {
            li.classList.add('current-day');
          }
          hoursOpenFragment.appendChild(li);
        }

        this.placeModalHoursOpen.appendChild(hoursOpenFragment);
      } else {
        this.placeModalHoursOpen.parentElement.classList.add('hidden');
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
