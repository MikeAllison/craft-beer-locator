describe('app.models.recentSearches', function() {
  var recentSearches = app.models.recentSearches;
  var initialSearches;

  beforeEach(function() {
    initialSearches = [{ lat: 98.76, lng: -54.32, city: "San Francisco", state: "CA", totalItems: 987 }];
    window.localStorage.removeItem('recentSearches');
    window.localStorage.setItem('recentSearches', JSON.stringify(initialSearches));
  });

  it('can add a recent search with .add()', function() {
    var newLoc = { lat: 12.34, lng: -56.78, city: 'Brooklyn', state: 'NY', totalItems: 321 };
    recentSearches.add(newLoc);
    expect(window.localStorage.recentSearches).toContain('{"lat":12.34,"lng":-56.78,"city":"Brooklyn","state":"NY","totalItems":321}');
  });

  it('can return an object of recent searches with .get()', function() {
    var allRecentSearches = recentSearches.get();
    expect(allRecentSearches).toEqual(initialSearches);
  });

});
