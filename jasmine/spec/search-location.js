describe('app.models.searchLoc', function() {
  var searchLoc = app.models.searchLoc;

  beforeEach(function() {
    searchLoc.lat = 12.34;
    searchLoc.lng = -56.78;
    searchLoc.city = 'San Francisco';
    searchLoc.state = 'CA';
    searchLoc.totalItems = 123;
    searchLoc.isGeoSearch = false;
  });

  it('nulls attribute values with .init()', function() {
    searchLoc.init();

    expect(searchLoc.lat).toBe(null);
    expect(searchLoc.lng).toBe(null);
    expect(searchLoc.city).toBe(null);
    expect(searchLoc.state).toBe(null);
    expect(searchLoc.totalItems).toBe(null);
    expect(searchLoc.isGeoSearch).toBe(null);
  });

  it('can set attributes with .setBasicDetails()', function() {
    var location = {
      lat: 98.76,
      lng: -54.32,
      city: 'Portland',
      state: 'OR',
      totalItems: 987
    };

    searchLoc.setBasicDetails(location);

    expect(searchLoc.lat).toEqual(location.lat);
    expect(searchLoc.lng).toEqual(location.lng);
    expect(searchLoc.city).toEqual(location.city);
    expect(searchLoc.state).toEqual(location.state);
    expect(searchLoc.totalItems).toEqual(location.totalItems);
  });

  it('can return a formatted City, State', function() {
    expect(searchLoc.cityState()).toEqual('San Francisco, CA');
  });

  it('will return undefined for .cityState() if city is null', function() {
    searchLoc.city = null;
    expect(searchLoc.cityState()).toBeUndefined();
  });

  it('will return undefined for .cityState() if state is null', function() {
    searchLoc.state = null;
    expect(searchLoc.cityState()).toBeUndefined();
  });
});
