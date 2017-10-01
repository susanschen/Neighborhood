/* global ko, document, google */

/**
 * The array for the Attraction Model to hold location details
 */

var attractionsData = [
  {title: 'Central Park', location: {lat: 40.767852, lng: -73.979694}, category: 'Parks', marker: null, wikiUrl: '', wikiText: ''},
  {title: 'Metropolitan Museum of Art', location: {lat: 40.779437, lng: -73.963244}, category: 'Buildings', marker: null, wikiUrl: '', wikiText: ''},
  {title: 'Prospect Park Zoo', location: {lat: 40.665375, lng: -73.965414}, category: 'Parks', marker: null, wikiUrl: '', wikiText: ''},
  {title: 'Times Square', location: {lat: 40.758895, lng: -73.985131}, category: 'Buildings', marker: null, wikiUrl: '', wikiText: ''},
  {title: 'United Nations', location: {lat: 40.748876, lng: -73.968009}, category: 'Buildings', marker: null, wikiUrl: '', wikiText: ''},
  {title: 'Empire State Building', location: {lat: 40.748541, lng: -73.985758}, category: 'Buildings', marker: null, wikiUrl: '', wikiText: ''}
];

// Class Attraction to hold the observables
var Attraction = function (data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.category = ko.observable(data.category);
  this.wikiUrl = ko.observable(data.wikiUrl);
  this.wikiText = ko.observable(data.wikiText);
};

/**
 * The ViewModel which also have map and wikipedia code
 *
 */

var ViewModel = function () {
  var self = this;

  // The Menu
  this.showMenu = ko.observable(true);
  this.toggleMenu = function () {
    this.showMenu(!this.showMenu());
  }.bind(this);

  // Get the list of attractions
  this.locations = ko.observableArray([]);
  attractionsData.forEach(function (attraction) {
    this.locations.push(new Attraction(attraction));
  }.bind(this));

  // Let user choose one place to display
  this.currentAttraction = ko.observable();

  // Filter the lists based on category
  this.filterOptions = ['All', 'Parks', 'Buildings'];
  this.selectedOption = ko.observable('All');

  // Compute the filtered list based on the filterOptions
  this.filteredList = ko.observableArray();

  // Start the filteredList with the locations array
  this.defaultList = function () {
    this.locations().forEach(function (location) {
      self.filteredList().push(location);
    });
  };

  this.defaultList();

  /*
   * Wiki API
   * Calls wikipedia and get the snippet if receive response
   * else, display error message if no response
   */
  this.wiki = function () {
    // Code that calls wiki needs to define current Attraction beforehand
    if(self.currentAttraction() !== undefined || self.currentAttraction() !== null){
      // Request the Wikipedia info
      var wikiAPI = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" +
      self.currentAttraction().title() + "&format=json";

      var request = $.ajax(wikiAPI, {
        dataType: "jsonp"
        });

      // On successful rertreival display the first article
      request.done(function (response) {
        var articleList = response[1];
        var snippetList = response[2];
        // Display just the first article
        var article = articleList[0];
        var snippet = snippetList[0];
        self.currentAttraction().wikiUrl('http://en.wikipedia.org/wiki/' + article);
        self.currentAttraction().wikiText(snippet);
        // Open infoWindow when wiki is succussful
        self.createInfoWindow(self.currentAttraction().marker);
      });

      // Open infowindow to display error message
      request.fail(function (jqXHR, textStatus) {
        self.currentAttraction().wikiText('Failed to load Wikipedia resource');
        self.currentAttraction().wikiUrl('');
        self.createInfoWindow(self.currentAttraction().marker);
      });
    }
  };

  /**
   * The Map Section
   */

  this.map = null;
  this.markers = [];
  this.largeInfowindow = null;

  this.initMap = function () {
    // Map style credit: https://snazzymaps.com/style/42/apple-maps-esque
    var styles = [
      { "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [{ "color": "#f7f1df" }] },
      { "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [{ "color": "#d0e3b4" }] },
      { "featureType": "landscape.natural.terrain",
        "elementType": "geometry",
        "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi.business",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi.medical",
        "elementType": "geometry",
        "stylers": [{ "color": "#fbd3da" }] },
      { "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#bde6ab" }] },
      { "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "visibility": "off" }] },
      { "featureType": "road",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }] },
      { "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffe15f" }] },
      { "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#efd151" }] },
      { "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }] },
      { "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "black" }] },
      { "featureType": "transit.station.airport",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#cfb2db" }] },
      { "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#a2daf2" }] }
    ];

    // Constructor creates a new map
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.714728, lng: -73.998672},
      zoom: 12,
      styles: styles,
      mapTypeControl: false
    });

    // Create one infowindow only, per Google API
    self.largeInfowindow = new google.maps.InfoWindow();

    this.createMarkers();
    this.showMarkers();
  }; // ends initMap

  // Populates the infowindow when the marker is clicked
  this.createInfoWindow = function (marker) {
    // clear any open infowindow
    self.largeInfowindow.marker = null;

    // Check to make sure the infowindow is not already opened on this marker.
    if (self.largeInfowindow.marker !== marker) {
      self.largeInfowindow.marker = marker;

      // Get the content, set it, and open infowindow on the map
      var wikiUrl = self.currentAttraction().wikiUrl();
      var wikiText = self.currentAttraction().wikiText();
      var content = '<div class = "infoWindow">' +
        '<a class = "infoHeader" href="' + wikiUrl + '">' +
        marker.title + '</a>' +
        '<p class = "wikiText">' + wikiText + '</p>' +
        '<p class = "wikiUrl"> Source: ' + wikiUrl + '</p>' +
        '</div>';
      self.largeInfowindow.setContent(content);
      self.largeInfowindow.open(this.map, marker);
      // Listen for closeclick on the infowindow
      self.largeInfowindow.addListener('closeclick', function () {
        self.largeInfowindow.marker = null;
        self.stopBounce();
      });
    }
  };

  // Sets the current Attraction based on user click,
  // and call Wiki (which is async)
  this.setAttraction = function (clicked) {
    self.stopBounce();
    self.currentAttraction(clicked);
    // Bounce matching marker
    var marker = self.currentAttraction().marker;
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // get wiki info
    self.wiki();
  };

  this.createMarkers = function () {
    // Style the markers
    var defaultIcon = this.makeMarkerIcon('f2c6a2');

    function markerClick () {
      self.stopBounce();
      this.setAnimation(google.maps.Animation.BOUNCE);
      self.currentAttraction(self.locations()[this.id]);
      self.wiki();
    }

    // Create the markers
    for (var i = 0; i < attractionsData.length; i++) {
      // Get the position from the location array.
      var position = attractionsData[i].location;
      var title = attractionsData[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });

      // add the marker to the matching location
      self.locations()[i].marker = marker;
      // Push the marker to our array of markers.
      this.markers.push(marker);

      // Create an onclick event to open the infowindow at each marker.
      marker.addListener('click', markerClick);
    }//ends for loop
  };

  // Stop all markers from bouncing
  this.stopBounce = function () {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setAnimation(null);
    }
  };

  // Show all markers
  this.showMarkers = function () {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(this.map);
      bounds.extend(this.markers[i].position);
    }
    this.map.fitBounds(bounds);
  };

  // Hide all markers
  this.hideMarkers = function () {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  };

  // When a user clicks on the drop-down:
  // - Clear old filter list, hide all markers,  and close any infowindow
  // - Create a new list and markers based on the user choice
  this.update = function () {
    // clear old list and markers
    this.locations().forEach(function (location) {
      this.filteredList.pop(location);
    }.bind(this));
    this.hideMarkers();

    // create new list and markers
    this.locations().forEach(function (location) {
      if(this.selectedOption() === 'All') {
        this.filteredList.push(location);
        location.marker.setMap(self.map);
      } else if (this.selectedOption() === 'Parks' && location.category() === 'Parks') {
        this.filteredList.push(location);
        location.marker.setMap(self.map);
      } else if (this.selectedOption() === 'Buildings' && location.category() === 'Buildings'){
        this.filteredList.push(location);
        location.marker.setMap(self.map);
      }
    }.bind(this));

    // close any open infowindow
    this.largeInfowindow.close();
  };

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  this.makeMarkerIcon = function (markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  };

  // Google Maps API error handler
  this.mapError = function () {
    alert ("Google Maps failed to load. Please try again later.");
  };

};

var viewModel = new ViewModel();

// Start the Knockout bindings
ko.applyBindings(viewModel);
