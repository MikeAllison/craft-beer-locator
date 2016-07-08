describe('app.models.places', function() {
  var places, initialPlaces;

  beforeEach(function() {
    initialPlaces = {
      primary: [{ place_id: 1, name: "Place One" }],
      secondary: [{ place_id: 2, name: "Place Two" }]
    };
    window.sessionStorage.setItem('places', JSON.stringify(initialPlaces));
    places = app.models.places;
  });

  it('clears sessionStorage.places when init() is called', function() {
    places.init();
    expect(window.sessionStorage.places).toBeUndefined();
  });

  it('can add a new value with add()', function() {
    var newPlace = {
      primary: [{ place_id: 3, name: 'Place Three' }]
    };
    places.add(newPlace);
    expect(window.sessionStorage.places).toEqual('{"primary":[{"place_id":3,"name":"Place Three"}]}');
  });

  it('can return places as an object with get()', function() {
    var allPlaces = places.get();
    expect(allPlaces).toEqual(initialPlaces);
  });

  it('can find a requested place with find()', function() {
    var requestedPlace = { place_id: 2, name: 'Place Two' };
    expect(places.find(requestedPlace)).toEqual({ place_id: 2, name: 'Place Two' });
  });
});
