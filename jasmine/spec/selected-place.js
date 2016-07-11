describe('app.models.selectedPlace', function() {
  var selectedPlace = app.models.selectedPlace;

  beforeEach(function() {
    selectedPlace.placeId = null;
    selectedPlace.lat = null;
    selectedPlace.lng = null;
    selectedPlace.name = null;
    selectedPlace.openNow = null;
    selectedPlace.website = null;
    selectedPlace.address = null;
    selectedPlace.googleMapsUrl = null;
    selectedPlace.phoneNum = null;
    selectedPlace.drivingInfo = {};
    selectedPlace.transitInfo = {};
    selectedPlace.hoursOpen = null;
  });

  it('nulls attribute values with .init()', function() {
    selectedPlace.placeId = 12345;
    selectedPlace.lat = 12.34;
    selectedPlace.lng = -56.78;
    selectedPlace.name = 'Place Name';
    selectedPlace.openNow = true;
    selectedPlace.website = 'http://www.placename.com';
    selectedPlace.address = '123 4th St. New York, NY 12121';
    selectedPlace.googleMapsUrl = 'http://maps.google.com?location=12345';
    selectedPlace.phoneNum = '(123) 456-7890';
    selectedPlace.drivingInfo = { distance: '12 mi', duration: '10 min.' };
    selectedPlace.transitInfo = { distance: '12 mi', duration: '10 min.' };
    selectedPlace.hoursOpen = ["Monday: 11:00 AM – 11:00 PM",
                               "Tuesday: 11:00 AM – 11:00 PM",
                               "Wednesday: 11:00 AM – 11:00 PM",
                               "Thursday: 11:00 AM – 11:00 PM",
                               "Friday: 11:00 AM – 12:00 AM",
                               "Saturday: 11:00 AM – 12:00 AM",
                               "Sunday: 12:00 – 11:00 PM"];

    selectedPlace.init();

    expect(selectedPlace.placeId).toBe(null);
    expect(selectedPlace.lat).toBe(null);
    expect(selectedPlace.lng).toBe(null);
    expect(selectedPlace.name).toBe(null);
    expect(selectedPlace.openNow).toBe(null);
    expect(selectedPlace.website).toBe(null);
    expect(selectedPlace.address).toBe(null);
    expect(selectedPlace.googleMapsUrl).toBe(null);
    expect(selectedPlace.phoneNum).toBe(null);
    expect(selectedPlace.drivingInfo).toEqual({});
    expect(selectedPlace.transitInfo).toEqual({});
    expect(selectedPlace.hoursOpen).toBe(null);
  });

  it('sets yes or no for .setOpenNow()', function() {
    selectedPlace.setOpenNow(true);
    expect(selectedPlace.openNow).toEqual('Yes');

    selectedPlace.setOpenNow(false);
    expect(selectedPlace.openNow).toEqual('No');
  });

  it('sets the website or an empty string with .setWebsite()', function() {
    selectedPlace.setWebsite('http://www.selected-place.com');
    expect(selectedPlace.website).toEqual('http://www.selected-place.com');

    selectedPlace.setWebsite(undefined);
    expect(selectedPlace.website).toEqual('');
  });

  it('properly formats the address with .setAddress()', function() {
    selectedPlace.setAddress('Brooklyn, NY, United States');
    expect(selectedPlace.address).toEqual('Brooklyn, NY');
  });

  it('sets the Google Maps URL or an empty string with .setGoogleMapsUrl()', function() {
    selectedPlace.setGoogleMapsUrl('http://maps.google.com?location=12345');
    expect(selectedPlace.googleMapsUrl).toEqual('http://maps.google.com?location=12345');

    selectedPlace.setGoogleMapsUrl(undefined);
    expect(selectedPlace.googleMapsUrl).toEqual('');
  });

  it('sets the phone number or an empty string with .setPhoneNum()', function() {
    selectedPlace.setPhoneNum('(123) 456-7890');
    expect(selectedPlace.phoneNum).toEqual('(123) 456-7890');

    selectedPlace.setPhoneNum(undefined);
    expect(selectedPlace.phoneNum).toEqual('');
  });

  it('sets the driving info or an empty string with .setDrivingInfo()', function() {
    selectedPlace.setDrivingInfo('10 mi.', '20 min.');
    expect(selectedPlace.drivingInfo.distance).toEqual('10 mi.');
    expect(selectedPlace.drivingInfo.duration).toEqual('20 min.');

    selectedPlace.setDrivingInfo(undefined);
    expect(selectedPlace.drivingInfo.distance).toEqual('');
    expect(selectedPlace.drivingInfo.duration).toEqual('');
  });

  it('sets the transit info or an empty string with .setTransitInfo()', function() {
    selectedPlace.setTransitInfo('10 mi.', '20 min.');
    expect(selectedPlace.transitInfo.distance).toEqual('10 mi.');
    expect(selectedPlace.transitInfo.duration).toEqual('20 min.');

    selectedPlace.setTransitInfo(undefined);
    expect(selectedPlace.transitInfo.distance).toEqual('');
    expect(selectedPlace.transitInfo.duration).toEqual('');
  });

  it('sets the hours or an empty string with .setHoursOpen()', function() {
    selectedPlace.setHoursOpen(["Monday: 11:00 AM – 11:00 PM",
                               "Tuesday: 11:00 AM – 11:00 PM",
                               "Wednesday: 11:00 AM – 11:00 PM",
                               "Thursday: 11:00 AM – 11:00 PM",
                               "Friday: 11:00 AM – 12:00 AM",
                               "Saturday: 11:00 AM – 12:00 AM",
                               "Sunday: 12:00 – 11:00 PM"]);
    expect(selectedPlace.hoursOpen).toEqual(["Monday: 11:00 AM – 11:00 PM",
                               "Tuesday: 11:00 AM – 11:00 PM",
                               "Wednesday: 11:00 AM – 11:00 PM",
                               "Thursday: 11:00 AM – 11:00 PM",
                               "Friday: 11:00 AM – 12:00 AM",
                               "Saturday: 11:00 AM – 12:00 AM",
                               "Sunday: 12:00 – 11:00 PM"]);

    selectedPlace.setHoursOpen(undefined);
    expect(selectedPlace.hoursOpen).toEqual('');
  });

  it('sets basic details with .setBasicDetails()', function() {
    selectedPlace.setBasicDetails({ place_id: 98765,
                                    geometry: { location: { lat: 123.45, lng: -56.78 }},
                                    name: 'Place Name' });
    expect(selectedPlace.placeId).toEqual(98765);
    expect(selectedPlace.lat).toEqual(123.45);
    expect(selectedPlace.lng).toEqual(-56.78);
    expect(selectedPlace.name).toEqual('Place Name');
  });

  it('sets specific details with .setSpecificDetails()', function() {
    selectedPlace.setSpecificDetails({ website: 'http://selected-place.com',
                                    formatted_address: '123 45th St. New York, NY 12121',
                                    url: 'http://maps.google.com?location=98765',
                                    formatted_phone_number: '(987) 654-3210',
                                    opening_hours: { open_now: false, weekday_text: ["Monday: 11:00 AM – 11:00 PM",
                                                                                     "Tuesday: 11:00 AM – 11:00 PM",
                                                                                     "Wednesday: 11:00 AM – 11:00 PM",
                                                                                     "Thursday: 11:00 AM – 11:00 PM",
                                                                                     "Friday: 11:00 AM – 12:00 AM",
                                                                                     "Saturday: 11:00 AM – 12:00 AM",
                                                                                     "Sunday: 12:00 – 11:00 PM"] }});
    expect(selectedPlace.website).toEqual('http://selected-place.com');
    expect(selectedPlace.address).toEqual('123 45th St. New York, NY 12121');
    expect(selectedPlace.googleMapsUrl).toEqual('http://maps.google.com?location=98765');
    expect(selectedPlace.openNow).toEqual('No');
    expect(selectedPlace.hoursOpen).toEqual(["Monday: 11:00 AM – 11:00 PM",
                                             "Tuesday: 11:00 AM – 11:00 PM",
                                             "Wednesday: 11:00 AM – 11:00 PM",
                                             "Thursday: 11:00 AM – 11:00 PM",
                                             "Friday: 11:00 AM – 12:00 AM",
                                             "Saturday: 11:00 AM – 12:00 AM",
                                             "Sunday: 12:00 – 11:00 PM"]);
  });

  it('does not throw an error if a place does not have opening hours', function() {
    selectedPlace.setSpecificDetails({ website: 'http://selected-place.com',
                                    formatted_address: '123 45th St. New York, NY 12121',
                                    url: 'http://maps.google.com?location=98765',
                                    formatted_phone_number: '(987) 654-3210' });
    expect(selectedPlace.website).toEqual('http://selected-place.com');
    expect(selectedPlace.address).toEqual('123 45th St. New York, NY 12121');
    expect(selectedPlace.googleMapsUrl).toEqual('http://maps.google.com?location=98765');
  });
});
