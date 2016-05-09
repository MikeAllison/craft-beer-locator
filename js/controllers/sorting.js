// Code related to sorting results

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // insertionSort - Sorts place results by distance
  app.controllers.insertionSort = function(unsorted) {
    var length = unsorted.length;

    for(var i=0; i < length; i++) {
      var temp = unsorted[i];

      for(var j=i-1; j >= 0 && (parseFloat(unsorted[j].drivingInfo.distance) > parseFloat(temp.drivingInfo.distance)); j--) {
        unsorted[j+1] = unsorted[j];
      }

      unsorted[j+1] = temp;
    }
  };

  // sortPlaces -Handles processing of places returned from Google.
  app.controllers.sortPlaces = function() {
    return new Promise(function(resolve, reject) {
      var primaryTypes = app.config.settings.search.primaryTypes;
      var secondaryTypes = app.config.settings.search.secondaryTypes;
      var excludedTypes = app.config.settings.search.excludedTypes;
      var primaryResults = [];
      var secondaryResults = [];
      var sortedResults = [];
      var places = app.models.places.get();

      // Sorts results based on relevent/exlcuded categories in app.config.settings.search
      for (var i=0; i < places.length; i++) {
        var hasPrimaryType = false;
        var hasSecondaryType = false;
        var hasExcludedType = false;

        // Check for primary types and push onto array for primary results
        for (var j=0; j < primaryTypes.length; j++) {
          if (places[i].types.includes(primaryTypes[j])) {
            hasPrimaryType = true;
          }
        }
        // Push onto the array
        if (hasPrimaryType) {
          primaryResults.push(places[i]);
        }

        // If the primary array doesn't contain the result, check for secondary types...
        // ...but make sure that it doesn't have a type on the excluded list
        if (!primaryResults.includes(places[i])) {
          for (var k=0; k < secondaryTypes.length; k++) {
            if (places[i].types.includes(secondaryTypes[k])) {
              hasSecondaryType = true;
              for (var l=0; l < excludedTypes.length; l++) {
                if(places[i].types.includes(excludedTypes[l])) {
                  hasExcludedType = true;
                }
              }
            }
          }
          // Push onto array for secondary results if it has a secondary (without excluded) type
          if (hasSecondaryType && !hasExcludedType) {
            secondaryResults.push(places[i]);
          }
        }
      }

      // Re-sort option because Google doesn't always return places by distance accurately
      if (app.config.settings.search.orderByDistance) {
        app.controllers.insertionSort(primaryResults);
        app.controllers.insertionSort(secondaryResults);
      }

      // Combine primary and secondary arrays
      sortedResults = primaryResults.concat(secondaryResults);

      if (sortedResults.length > 0) {
        // Adds search results to sessionStorage
        app.models.places.add(sortedResults);
      } else {
        app.models.places.init();
        app.views.alerts.info('Your request returned no results.');
        app.views.results.render();
      }
      resolve();
    });
  };

})();
