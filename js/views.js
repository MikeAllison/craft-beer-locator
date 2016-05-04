/* jshint -W083 */ // Silence JSHint's warning "Don't make functions within a loop" to allow closures

var app = app || {};

(function() {

  app.views = {
    page: {
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
        app.views.moreResultsBtn.hide();
        app.views.moreResultsBtn.disable();
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
    },
    map: {
      init: function() {
        // Collect DOM elements
        this.map = document.getElementById('map');
      }
    },
    form: {
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
            app.controller.formSearch();
          }
        });
        this.searchBtn.addEventListener('click', function() {
          app.views.page.disableButtons();
          app.views.page.clear();
          app.controller.formSearch();
        });
      },
      setTboxPlaceholder: function() {
        this.cityStateTbox.value = null;
        this.cityStateTbox.setAttribute('placeholder', app.models.userLocation.formattedAddress || app.models.searchLocation.formattedAddress);
      },
      disableSearchBtn: function() {
        this.searchBtn.setAttribute('disabled', true);
      },
      enableSearchBtn: function() {
        this.searchBtn.removeAttribute('disabled');
      }
    },
    locationBtn: {
      init: function() {
        // Collect DOM elements
        this.locationBtn = document.getElementById('locationBtn');
        // Add click handlers
        this.locationBtn.addEventListener('click', function() {
          app.views.page.disableButtons();
          app.views.page.clear();
          app.controller.geolocationSearch();
        });
      },
      disable: function() {
        this.locationBtn.setAttribute('disabled', true);
      },
      enable: function() {
        this.locationBtn.removeAttribute('disabled');
      }
    },
    alerts: {
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
    },
    results: {
      init: function() {
        // Collect DOM elements
        this.resultsList = document.getElementById('resultsList');
      },
      clear: function() {
        this.resultsList.textContent = null;
      },
      render: function() {
        this.resultsList.textContent = null;
        this.resultsList.classList.remove('hidden');

        var results = app.models.places.get();

        if (results) {
          for (var i=0; i < results.length; i++) {
            var li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = results[i].name;

            var span = document.createElement('span');
            span.classList.add('badge');
            span.textContent = results[i].drivingInfo.distance;

            li.appendChild(span);

            li.addEventListener('click', (function(place) {
              return function() {
                app.controller.getDetails(place);
              };
            })(results[i]));

            this.resultsList.appendChild(li);
          }
        }
        // Select results tab and panel to show new results
        $('#resultsTab').tab('show');
      }
    },
    recentSearches: {
      init: function() {
        // Collect DOM elements
        this.recentSearchesList = document.getElementById('recentSearchesList');
        this.render();
      },
      render: function() {
        this.recentSearchesList.textContent = null;
        var recentSearches = app.models.recentSearches.get();

        if (recentSearches) {
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
                app.controller.recentSearch(location);
              };
            })(recentSearches[i]));

            this.recentSearchesList.appendChild(li);
          }
        } else {
          var li = document.createElement('li');
          li.classList.add('list-group-item');
          li.classList.add('text-center');
          li.textContent = 'You have no recent searches.';
          this.recentSearchesList.appendChild(li);
        }
      }
    },
    itemModal: {
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
          app.controller.getMyDistance();
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
    },
    moreResultsBtn: {
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
          app.controller.requestMoreResults();
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
    }
  };

})();
