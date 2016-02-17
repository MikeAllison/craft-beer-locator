(function() {

  var httpRequest;

  document.getElementById("submitButton").onclick = function() {
    var cityState = document.getElementById("cityState").value;
    getLocation(cityState);
  };

  function getLocation(cityState) {
    httpRequest = new XMLHttpRequest();
    var apiKey = 'AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
    var params = '?' + apiKey + '&address=' + encodeURIComponent(cityState);
    var url = 'https://maps.googleapis.com/maps/api/geocode/json' + params;

    if (!httpRequest) {
      alert('Sorry, your request could not be completed.');
      return false;
    }

    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('GET', url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    httpRequest.send();
  }

  function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        var response = JSON.parse(httpRequest.responseText);
        var lat = response.results[0].geometry.location.lat
        var lng = response.results[0].geometry.location.lng
        console.log(lat + ' ' + lng);
      } else {
        alert('Sorry, please try again.');
      }
    }
  }

})();
