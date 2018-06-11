//Model
var locations = [
    {title: 'Kinkaku-ji', lat: 35.039444, lng: 135.729444},
    {title: 'Ginkaku-ji', lat: 35.026667, lng: 135.798333},
    {title: 'Fushimi Inari-taisha', lat: 34.967222, lng: 135.772778},
    {title: 'Shimogamo Shrine', lat: 35.038889, lng: 135.7725},
    {title: 'Nanzen-ji', lat: 35.011111, lng: 135.794167},
    {title: 'Sanjūsangen-dō', lat: 34.987778, lng: 135.771667},
    {title: 'Kifune Shrine', lat: 35.121667, lng: 135.762778},
    {title: 'Byōdō-in', lat: 34.889444, lng: 135.807778},
    {title: 'Tō-ji', lat: 34.980556, lng: 135.747778},
    {title: 'Yasaka Shrine', lat: 35.003611, lng: 135.778611},
    {title: 'Kennin-ji', lat: 35.001111, lng: 135.773611}
];


// Create a new blank array for all the listing markers.
var markers = [];


// Init Map
function initMap() {
  var map;

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.001111, lng: 135.773611}, zoom: 12,
  });

  var infowindow = new google.maps.InfoWindow();

  // Call wikiedia api function and start app
  callWikiApi();

  // Set knockout bindings
  var vm = new AppViewModel();
  ko.applyBindings(vm);


  // Bellow is functions


  // Loop function using wikiApi function
  function callWikiApi(){
    for (i = 0; i < locations.length; i++) {
      wikiApi(locations[i],locations[i].title,i);
    };
  }

  // Retrive information using wikipediapi and call callbackCreateMarker function
  function wikiApi(location,locationTitle,i) {
    var $wikiElem = $('#wikipedia');
    var $wikiImgElem = $('#wikipedia-img')
    var searchTerm = locationTitle;
    $wikiElem.text("");
    var wikiElemUrl = `http://en.wikipedia.org/w/api.php?action=opensearch&search=${searchTerm}&format=json&callback=wikipediaCallback`;

    // Wikipedia api error handling
    var wikiRequestTimeout = setTimeout(function(){
      alert("Error: Wikipedia API");
    }, 5000);

    // Retrive location title, snippet, link 
    $.ajax({
      url: wikiElemUrl,
      dataType: "jsonp",
      success: function(responseElm){

      // Title response
      var articleTitle = responseElm[1];

      // Snippet response
      var articleListSnippet = responseElm[2];

      // Link response
      var articleListLink = responseElm[3];

      // Append informations to locations array
      var content1 = '<div class="articleTitle"><a href="' + articleListLink[0] + '">' + articleTitle[0] + '</a></div>'+ '<div class="articleListSnippet">' + articleListSnippet[0] + '</div>';
      location['wikiElem'] = content1;

      clearTimeout(wikiRequestTimeout);


      var wikiImgElemUrl =`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&gpssearch=${searchTerm}&pithumbsize=250&formatversion=2&generator=prefixsearch`;

      // Wikipedia api error handling
      var wikiImgRequestTimeout = setTimeout(function(){
        alert("Error: Wikipedia API");
      }, 5000);

      // Retrive location image 
      $.ajax({
        url: wikiImgElemUrl,
        method: "GET",
        dataType: "jsonp",
        success: function(responseImgElm) {

        // Append image information to locations array
        var content2 = `<img class="wikiImg" src='${responseImgElm.query.pages[0].thumbnail.source}'>`;
        location['wikiImgElem'] = content2;

        clearTimeout(wikiImgRequestTimeout);

        // Connect with next function
        callbackCreateMarker(i);
      },
    })
    }
  })
    return false;
  };

  // Function to call createMarker function that create marker each locations and push this to markers array
  function callbackCreateMarker(i){
    locations[i].marker = createMarker(new google.maps.LatLng(locations[i].lat, locations[i].lng),locations[i].wikiImgElem+locations[i].wikiElem,i);
    markers.push(locations[i].marker);
  };

  // Function to create markers 
  function createMarker(latlng,content,i) {
    locations[i].marker = new google.maps.Marker({
      position: latlng,
      animation: google.maps.Animation.DROP,
    });

    google.maps.event.addListener(locations[i].marker, 'click', function() {
      infowindow.open(map, this);
      infowindow.setContent(content);
    });

    setMarkerFirst();

    return locations[i].marker;
  }

  // Function to set marker firstly
  function setMarkerFirst(){
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    };
  };

  // ViewModel
  function AppViewModel() {

    // Function to set markers
    function setMarker(i) {
      locations[i].marker.setMap(map);
    };

    // Function to clear markers  
    function clearMarker(i) {
      locations[i].marker.setMap(null);
    };

    var self = this;

    // When click location list, pop up marker
    this.clickeList = function (clickedMaker) {
      google.maps.event.trigger(clickedMaker.marker, 'click');
    };

    //Observable for text input 
    self.filter = ko.observable("");

    // Text filter using knockout
    this.filteredViewList = ko.computed(function () {
      var search = this.filter().toLowerCase();
      if (!search) {

        // Set all markers and locations list
        for (var i = 0; i < markers.length; i++) {
          setMarker(i);
        };
        return locations;
      } else {

        //Firstly reset all markers
        for (var i = 0; i < markers.length; i++) {
          clearMarker(i)
        };

        // Create a new blank array for visible list.
        var visibleList = [];
        for (var i = 0; i < locations.length; i++) {
          if (locations[i].title.toString().toLowerCase().indexOf(search) >= 0){

          // Create new visible list and set markers 
          visibleList.push(locations[i]);
          setMarker(i);
        }
      }
      return visibleList;
    }
  }, this);
  }


// End line of initMap function
}

  
// Google maps error handling
function mapError() {
  alert("Error: Google maps API");
};