/*********************************
  Code related to sorting results
**********************************/

(function() {

  app.modules = app.modules || {};

  /***************************************************
    insertionSort() - Sorts place results by distance
  ****************************************************/
  app.modules.insertionSort = function(unsorted) {
    var length = unsorted.length;

    for (var i = 0; i < length; i++) {
      var temp = unsorted[i];

      for (var j = i-1; j >= 0 && (parseFloat(unsorted[j].drivingInfo.value) > parseFloat(temp.drivingInfo.value)); j--) {
        unsorted[j+1] = unsorted[j];
      }

      unsorted[j+1] = temp;
    }
  };

  /******************************************************************
    sortPlaces() - Handles processing of places returned from Google
  *******************************************************************/
  app.modules.sortPlaces = function(places) {
    var primaryTypes = app.config.settings.search.primaryTypes;
    var secondaryTypes = app.config.settings.search.secondaryTypes;
    var excludedTypes = app.config.settings.search.excludedTypes;
    var primaryResults = [];
    var secondaryResults = [];
    var sortedResults = { primary: null, secondary: null };

    // Sorts results based on relevent/exlcuded categories in app.config.settings.search
    for (var i = 0, length = places.length; i < length; i++) {
      var hasPrimaryType = false;
      var hasSecondaryType = false;
      var hasExcludedType = false;

      // Check for primary types and push onto array for primary results
      primaryTypes.forEach(function(primaryType) {
        if (places[i].types.includes(primaryType)) {
          hasPrimaryType = true;
        }
      });
      // Push onto the array
      if (hasPrimaryType) {
        primaryResults.push(places[i]);
      }

      // If the primary array doesn't contain the result, check for secondary types...
      // ...but make sure that it doesn't have a type on the excluded list
      if (!primaryResults.includes(places[i])) {
        secondaryTypes.forEach(function(secondaryType) {
          if (places[i].types.includes(secondaryType)) {
            hasSecondaryType = true;

            excludedTypes.forEach(function(excludedType) {
              if(places[i].types.includes(excludedType)) {
                hasExcludedType = true;
              }
            });
          }
        });

        // Push onto array for secondary results if it has a secondary (without excluded) type
        if (hasSecondaryType && !hasExcludedType) {
          secondaryResults.push(places[i]);
        }
      }
    }

    // Re-sort option because Google doesn't always return places by distance accurately
    if (app.config.settings.search.orderByDistance) {
      app.modules.insertionSort(primaryResults);
      app.modules.insertionSort(secondaryResults);
    }

    if (primaryResults.length === 0 && secondaryResults.length === 0) {
      reject({ type: 'info', text: 'Your request returned no results.' });
      return;
    }

    sortedResults.primary = primaryResults;
    sortedResults.secondary = secondaryResults;

    return sortedResults;
  };

})();
