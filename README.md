# craft-beer-finder
JavaScript app using Google services, HTML5 geolocation, JavaScript promises, localStorage, and sessionStorage to find craft beer in a specified area (but search settings can be modified to search for almost anything)

#### Configuring Search Settings:

```javascript
app = {
  init: function() {
    this.settings = {
      search: {
        itemType: 'craft beer', // Can change: This can be set to anything that you'd like to search for
        rankBy: google.maps.places.RankBy.DISTANCE, // Can change: Can be either google.maps.places.RankBy.DISTANCE or google.maps.places.RankBy.PROMINENCE (not a string)
        radius: '25000', // Can change: Radius is required if rankBy is set to google.maps.places.RankBy.PROMINENCE (max: 50000)

        // SEARCH SORTING/FILTERING:
        // These settings will help narrow down to relevant results
        // Types (primaryTypes/secondaryTypes/excludedTypes) can be any Google Place Type: https://developers.google.com/places/supported_types

        // primaryTypes: Any result having these types will be sorted and listed first
        primaryTypes: ['bar', 'store'], // Array w/ empty string or multi-string (examples: [''], ['type1'], ['type1, 'type2'], etc.)

        // secondaryTypes: Any result having these types will be listed after primaryTypes
        secondaryTypes: ['restaurant'], // Array w/ empty string or multi-string (examples: [''], ['type1'], ['type1, 'type2'], etc.)

        // excludedTypes: Any result having these types will excluded from the results
        excludedTypes: [''], // Array w/ empty string or multi-string (examples: [''], ['type1'], ['type1, 'type2'], etc.)

        topResultsOnly: false // Can change: Allows search to return more than 1 set of results (true/false)
      }
    };
    this.google = {
      apiKey: 'YOUR_GOOGLE_API_KEY' // Change: Enter your Google API key
    };
    this.google.geocodingAPI = {
      reqURL: 'https://maps.googleapis.com/maps/api/geocode/json?' // Don't change: URL to request location's geocode from Google
    };
  }
};
```
