var app = app || {};

(function() {

  app.controllers = app.controllers || {};

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
            console.log('Primary: ' + places[i].name);
            hasPrimaryType = true;
          }
        }
        // Push onto the array
        if (hasPrimaryType) {
          console.log('Pushed to primary: ' + places[i].name);
          primaryResults.push(places[i]);
        }

        // If the primary array doesn't contain the result, check for secondary types...
        // ...but make sure that it doesn't have a type on the excluded list
        if (!primaryResults.includes(places[i])) {
          for (var k=0; k < secondaryTypes.length; k++) {
            if (places[i].types.includes(secondaryTypes[k])) {
              console.log('Secondary: ' + places[i]);
              hasSecondaryType = true;
              for (var l=0; l < excludedTypes.length; l++) {
                if(places[i].types.includes(excludedTypes[l])) {
                  console.log('Exclude: ' + places[i]);
                  hasExcludedType = true;
                }
              }
            }
          }
          // Push onto array for secondary results if it has a secondary (without excluded) type
          if (hasSecondaryType && !hasExcludedType) {
            console.log('Pushed to secondary: ' + places[i].name);
            secondaryResults.push(places[i]);
          }
        }
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
