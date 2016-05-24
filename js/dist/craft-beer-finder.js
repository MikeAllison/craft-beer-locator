var app = app || {};

(function() {

  app.config = {
    init: function() {
      this.settings = {
        search: {
          // itemType - Can change: This can be set to anything that you'd like to search for (i.e. 'craft beer' or 'brewery')
          itemType: 'craft beer',

          // rankBy -  Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
          rankBy: google.maps.places.RankBy.DISTANCE,

          // orderByDistance - Can change: Setting 'true' will force a reordering of results by distance (results from Google's RankBy.DISTANCE aren't always in order)
          // Set to 'false' if using 'rankBy: google.maps.places.RankBy.PROMINENCE' and don't want results ordered by distance
          // Sometimes using 'RankBy.PROMINENCE' and 'orderByDistance: true' returns the most accurate results by distance
          orderByDistance: true,

          // radius - Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)
          radius: '25000',

          // SEARCH SORTING/FILTERING:
          // These settings will help narrow down to relevant results
          // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

          // primaryTypes - Any result having these types will be sorted and listed first (examples: [], ['type1'], ['type1, 'type2'], etc.)
          primaryTypes: ['bar', 'liquor_store'],

          // secondaryTypes: Any result having these types will be listed after primaryTypes (examples: [], ['type1'], ['type1, 'type2'], etc.)
          secondaryTypes: ['restaurant'],

          // excludedTypes: Any result having these types will excluded from the results (examples: [], ['type1'], ['type1, 'type2'], etc.)
          excludedTypes: [],

          // topResultsOnly -  Can change: Allows search to return more than 1 set of results (true/false)
          topResultsOnly: false
        }
      };
      // Set your API key for Google Maps services
      this.google = {
        apiKey: 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo'
      };
      this.google.geocodingAPI = {
        reqURL: 'https://maps.googleapis.com/maps/api/geocode/json?'
      };
    }
  };

})();

var app = app || {};

(function() {

  app.models = app.models || {};

  app.models.places = {
    init: function() {
      sessionStorage.clear();
      this.paginationObj = {};
    },
    // Adds an array of results of search to sessionStorage
    add: function(places) {
      sessionStorage.setItem('places', JSON.stringify(places));
    },
    // Retrieves an array of results of search from sessionStorage
    get: function() {
      return JSON.parse(sessionStorage.getItem('places'));
    },
    find: function(requestedPlace) {
      var places = this.get();

      for (var i=0; i < places.length; i++) {
        if (places[i].place_id === requestedPlace.place_id) {
          return places[i];
        }
      }
    },
    setPaginationObj: function(paginationObj) {
      this.paginationObj = paginationObj;
    }
  };

})();

var app = app || {};

(function() {

  app.models = app.models || {};

  app.models.recentSearches = {
    add: function() {
      var cachedSearches = this.get();

      if (!cachedSearches) {
        cachedSearches = [];
      } else if (cachedSearches.length >= 5) {
        cachedSearches.pop();
      }

      var newLocation = {};
      newLocation.lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      newLocation.lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      newLocation.formattedAddress = app.models.userLoc.formattedAddress || app.models.searchLoc.formattedAddress;
      newLocation.totalItems = app.models.userLoc.totalItems || app.models.searchLoc.totalItems;
      cachedSearches.unshift(newLocation);

      localStorage.setItem('recentSearches', JSON.stringify(cachedSearches));
    },
    get: function() {
      return JSON.parse(localStorage.getItem('recentSearches'));
    }
  };

})();

var app = app || {};

(function() {

  app.models = app.models || {};

  app.models.searchLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setLat: function(lat) {
      this.lat = lat;
    },
    setLng: function(lng) {
      this.lng = lng;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    }
  };

})();

var app = app || {};

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
    setPlaceId: function(placeId) {
      this.placeId = placeId;
    },
    setLat: function(lat) {
      this.lat = lat;
    },
    setLng: function(lng) {
      this.lng = lng;
    },
    setName: function(name) {
      this.name = name;
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
    }
  };

})();

var app = app || {};

(function() {

  app.models = app.models || {};

  app.models.userLoc = {
    init: function() {
      this.lat = null;
      this.lng = null;
      this.formattedAddress = null;
      this.totalItems = null;
    },
    setLat: function(lat) {
      this.lat = lat;
    },
    setLng: function(lng) {
      this.lng = lng;
    },
    setFormattedAddress: function(address) {
      this.formattedAddress = address.replace(/((\s\d+)?,\sUSA)/i, '');
    },
    setTotalItems: function(totalItems) {
      this.totalItems = totalItems;
    }
  };

})();

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
    show: function(type, msg) {
      var alertClass;

      if (type === 'error') {
        alertClass = 'alert-danger';
      } else if (type === 'info') {
        alertClass = 'alert-info';
      } else if (type === 'success') {
        alertClass = 'alert-success';
      }

      this.alert.textContent = msg;
      this.alert.classList.add(alertClass);
      this.alert.classList.remove('hidden');
    }
  };

})();

// Code related to the form and searching with the app

var app = app || {};

(function() {

  app.views = app.views || {};

  // City/state form
  app.views.form = {
    init: function() {
      // Collect DOM elements
      this.cityStateTbox = document.getElementById('cityStateTbox');
      this.searchBtn = document.getElementById('searchBtn');
      // Set default values on DOM elements
      this.cityStateTbox.setAttribute('autofocus', true);
      this.cityStateTbox.setAttribute('placeholder', 'New York, NY');
      // Add click handlers
      this.cityStateTbox.addEventListener('click', function() {
        this.value = null;
      });
      this.cityStateTbox.addEventListener('keyup', function(e) {
        if (e.keyCode === 13) {
          app.views.page.disableButtons();
          app.views.page.clear();
          app.controllers.formSearch();
        }
      });
      this.searchBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        app.controllers.formSearch();
      });
    },
    setTboxPlaceholder: function() {
      this.cityStateTbox.value = null;
      this.cityStateTbox.setAttribute('placeholder', app.models.userLoc.formattedAddress || app.models.searchLoc.formattedAddress);
    },
    disableSearchBtn: function() {
      this.searchBtn.setAttribute('disabled', true);
    },
    enableSearchBtn: function() {
      this.searchBtn.removeAttribute('disabled');
    }
  };

  // Location button
  app.views.locationBtn = {
    init: function() {
      // Collect DOM elements
      this.locationBtn = document.getElementById('locationBtn');
      // Add click handlers
      this.locationBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        app.controllers.geolocationSearch();
      });
    },
    disable: function() {
      this.locationBtn.setAttribute('disabled', true);
    },
    enable: function() {
      this.locationBtn.removeAttribute('disabled');
    }
  };

  // More results button if > 20 results are returned from the search
  app.views.moreResultsBtn = {
    init: function() {
      // Collect DOM elements
      this.moreResultsBtn = document.getElementById('moreResultsBtn');
      // Set default values on DOM elements
      this.moreResultsBtn.classList.add('hidden');
      // Add click handlers
      this.moreResultsBtn.addEventListener('click', function() {
        app.views.page.disableButtons();
        app.views.page.clear();
        window.scroll(0, 0);
      });
    },
    addNextPageFn: function() {
      this.moreResultsBtn.onclick = function() {
        app.controllers.requestMoreResults();
      };
    },
    show: function() {
      this.moreResultsBtn.classList.remove('hidden');
      // Google Places search requires 2 seconds between searches
      window.setTimeout(function() {
        moreResultsBtn.removeAttribute('disabled');
      }, 2000);
    },
    disable: function() {
      this.moreResultsBtn.setAttribute('disabled', true);
    },
    hide: function() {
      this.moreResultsBtn.classList.add('hidden');
    }
  };

})();

var app = app || {};

(function() {

  app.views = app.views || {};

  // Google Map's map object (needed for API but not displayed on page)
  app.views.map = {
    init: function() {
      // Collect DOM elements
      this.map = document.getElementById('map');
    }
  };

  // Control multiple items on the page
  app.views.page = {
    init: function() {
      // Initialize page settings
      var searchItemTypeCaps = '';
      var searchItemType = app.config.settings.search.itemType.split(/\s+/);
      for (var i=0; i < searchItemType.length; i++) {
        searchItemTypeCaps += ' ' + searchItemType[i].charAt(0).toUpperCase() + searchItemType[i].slice(1);
      }
      var pageTitle = searchItemTypeCaps + ' Finder';
      document.title = pageTitle;
      document.getElementById('heading').textContent = pageTitle;
    },
    clear: function() {
      app.views.alerts.clear();
      app.views.results.clear();
    },
    disableButtons: function() {
      app.views.form.disableSearchBtn();
      app.views.locationBtn.disable();
    },
    enableButtons: function() {
      window.setTimeout(function() {
        app.views.form.enableSearchBtn();
        app.views.locationBtn.enable();
      }, 250);
    }
  };

})();

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
      // Reset hidden fields on each render
      var sections = document.getElementById('placeModalBody').children;
      for (var i=0; i < sections.length; i++) {
        sections[i].classList.remove('hidden');
      }

      var currentDay = new Date().getDay();
      // Adjust to start week on Monday for hoursOpen
      currentDay -= 1;
      // Adjust for Sundays: JS uses a value of 0 and Google uses a value of 6
      currentDay = currentDay === -1 ? 6 : currentDay;
      this.placeModalTitle.textContent = app.models.selectedPlace.name;

      if (app.models.selectedPlace.openNow) {
        this.placeModalOpenNow.textContent = app.models.selectedPlace.openNow;
      } else {
        this.placeModalOpenNow.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.website) {
        this.placeModalWebsite.setAttribute('href', app.models.selectedPlace.website);
        this.placeModalWebsite.textContent = app.models.selectedPlace.website;
      } else {
        this.placeModalWebsite.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.address) {
        this.placeModalAddress.setAttribute('href', app.models.selectedPlace.googleMapsUrl);
        this.placeModalAddress.textContent = app.models.selectedPlace.address;
      } else {
        this.placeModalAddress.parentElement.classList.add('hidden');
      }

      if (app.models.selectedPlace.phoneNum) {
        this.placeModalPhoneNum.setAttribute('href', 'tel:' + app.models.selectedPlace.phoneNum);
        this.placeModalPhoneNum.textContent = app.models.selectedPlace.phoneNum;
      } else {
        this.placeModalPhoneNum.parentElement.classList.add('hidden');
      }

      // Only show message if geolocation search isn't being used
      if (app.models.userLoc.lat && app.models.userLoc.lng) {
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
        // Hack to help prevent exceeding Google's query limits
        window.setTimeout(function() {
          app.controllers.switchToGeolocation();
        }, 1500);
      });

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
        for (var j=0; j < app.models.selectedPlace.hoursOpen.length; j++) {
          var li = document.createElement('li');
          // Split hoursOpen on ':'
          var dayTime = app.models.selectedPlace.hoursOpen[j].split(/:\s/);
          // <span> is needed to highlight hours for current day
          li.innerHTML = '<span><strong>' + dayTime[0] + ':</strong>' + dayTime[1] + '</span>';
          // Highlight current day of week
          if (j === currentDay) {
            li.classList.add('current-day');
          }
          this.placeModalHoursOpen.appendChild(li);
        }
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

var app = app || {};

(function() {

  app.views = app.views || {};

  // Recent searches list
  app.views.recentSearches = {
    init: function() {
      // Collect DOM elements
      this.recentSearchesList = document.getElementById('recentSearchesList');
      this.render();
    },
    render: function() {
      this.recentSearchesList.textContent = null;
      var recentSearches = app.models.recentSearches.get();

      if (!recentSearches) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.classList.add('text-center');
        li.textContent = 'You have no recent searches.';
        this.recentSearchesList.appendChild(li);
        return;
      }

      for (var i=0; i < recentSearches.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = recentSearches[i].formattedAddress;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = recentSearches[i].totalItems;

        li.appendChild(span);

        li.addEventListener('click', (function(location) {
          return function() {
            app.views.page.disableButtons();
            app.views.page.clear();
            app.controllers.recentSearch(location);
          };
        })(recentSearches[i]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        this.recentSearchesList.appendChild(li);
      }
    }
  };

})();

var app = app || {};

(function() {

  app.views = app.views || {};

  // Results list
  app.views.results = {
    init: function() {
      // Collect DOM elements
      this.resultsList = document.getElementById('resultsList');
    },
    clear: function() {
      this.resultsList.textContent = null;
      app.views.moreResultsBtn.hide();
      app.views.moreResultsBtn.disable();
    },
    render: function() {
      this.resultsList.textContent = null;
      this.resultsList.classList.remove('hidden');

      var places = app.models.places.get();
      if (!places) {
        app.views.alerts.show('info', 'Your request returned no results.');
        return;
      }

      for (var i=0; i < places.length; i++) {
        var li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = places[i].name;

        var span = document.createElement('span');
        span.classList.add('badge');
        span.textContent = places[i].drivingInfo.distance;

        li.appendChild(span);

        li.addEventListener('click', (function(place) {
          return function() {
            app.controllers.getDetails(place);
          };
        })(places[i]));

        (function(li) {
          li.addEventListener('click', function() {
            li.classList.add('clicked');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseover', function() {
            li.classList.add('hovered');
          });
        })(li);

        (function(li) {
          li.addEventListener('mouseout', function() {
            li.classList.remove('hovered');
            li.classList.remove('clicked');
          });
        })(li);

        this.resultsList.appendChild(li);
      }

      // Select results tab and panel to show new results
      $('#resultsTab').tab('show');
    }
  };

})();

var app = app || {};

$(function() {

  // Start the app

  // Set defaults on variables to control flow of search
  this.newSearch = true;

  // Initialize config, models, & views
  app.config.init();
  app.models.searchLoc.init();
  app.models.places.init();
  app.views.page.init();
  app.views.map.init();
  app.views.form.init();
  app.views.locationBtn.init();
  app.views.alerts.init();
  app.views.results.init();
  app.views.recentSearches.init();
  app.views.placeModal.init();
  app.views.moreResultsBtn.init();

});
