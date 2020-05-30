/**********************
  Selected Place Model
***********************/

(function() {

  app.models = app.models || {};

  app.models.selectedPlace = {
    init: function() {
      this.placeId = null;
      this.lat = null;
      this.lng = null;
      this.name = null;
      this.openNow = null;
      this.website = null;
      this.address = null;
      this.googleMapsUrl = null;
      this.phoneNum = null;
      this.drivingInfo = {};
      this.transitInfo = {};
      this.hoursOpen = null;
    },
    setOpenNow: function(openNow) {
      this.openNow = openNow ? 'Yes' : 'No';
    },
    setWebsite: function(website) {
      this.website = website ? website : '';
    },
    setAddress: function(address) {
      this.address = address.replace(/, United States/i, '');
    },
    setGoogleMapsUrl: function(googleMapsUrl) {
      this.googleMapsUrl = googleMapsUrl ? googleMapsUrl : '';
    },
    setPhoneNum: function(phoneNum) {
      this.phoneNum = phoneNum ? phoneNum : '';
    },
    setDrivingInfo: function(distance, duration) {
      this.drivingInfo.distance = distance ? distance : '';
      this.drivingInfo.duration = duration ? duration : '';
    },
    setTransitInfo: function(distance, duration) {
      this.transitInfo.distance = distance ? distance : '';
      this.transitInfo.duration = duration ? duration : '';
    },
    setHoursOpen: function(hoursOpen) {
      this.hoursOpen = hoursOpen ? hoursOpen : '';
    },
    setBasicDetails: function(place) {
      this.placeId = place.place_id;
      this.lat = place.geometry.location.lat;
      this.lng = place.geometry.location.lng;
      this.name = place.name;
    },
    setSpecificDetails: function(place) {
      this.setWebsite(place.website);
      this.setAddress(place.formatted_address);
      this.setGoogleMapsUrl(place.url);
      this.setPhoneNum(place.formatted_phone_number);
      // This is needed to guard against items without opening_hours
      if (place.opening_hours) {
        this.setOpenNow(place.opening_hours.isOpen());
        this.setHoursOpen(place.opening_hours.weekday_text);
      }
    }
  };

})();
