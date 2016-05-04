var app = app || {};

(function(){

  app.config = {
    init: function() {
      // Set the type and radius of thing to search for (i.e. 'brewery' or 'craft beer')
      this.settings = {
        search: {
          // itemType - Can change: This can be set to anything that you'd like to search for
          itemType: 'craft beer',
          // rankBy -  Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
          rankBy: google.maps.places.RankBy.DISTANCE,
          // radius - Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)
          radius: '25000',

          // SEARCH SORTING/FILTERING:
          // These settings will help narrow down to relevant results
          // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

          // primaryTypes - Any result having these types will be sorted and listed first (examples: [], ['type1'], ['type1, 'type2'], etc.)
          primaryTypes: ['bar', 'store'],

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

  // Start the app
  app.controller.init();

})();
