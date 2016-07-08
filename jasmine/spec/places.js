describe('places', function() {
  var places;

  beforeEach(function() {
    places = app.models.places;
  });

  it('clears sessionStorage.places when init() is called', function() {
    window.sessionStorage.setItem('places', 'not empty');
  });
});
