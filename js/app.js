(function() {
  var httpRequest;
  document.getElementById("submitButton").onclick = function() {
    var cityState = document.getElementById("cityState").value;
    getLocation(cityState);
  };

  function getLocation(cityState) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      alert('Sorry, your request could not be completed.');
      return false;
    }

    httpRequest.onReadyStateChange = alertContents;
    httpRequest.open('POST', 'https://maps.googleapis.com/maps/api/geocode/json', true);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var params = '?address=Boston,MA&key=AIzaSyBCaX60okxecYLD05GC745IP1u6nzwKDSo';
    console.log(params);
    httpRequest.send(params);
  }

  function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        alert('worked');
      } else {
        alert('Sorry, please try again.');
      }
    }
  }
})();
