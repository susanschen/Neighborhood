/* global ko, document, google */

/**
 * The Model ViewModel Section
 */
//var initialCats = [{
//  clickCount: 0,
//  name: 'Tabby',
//  imgSrc: 'img/434164568_fea0ad4013_z.jpg',
//  imgAttribution: 'https:www.flickr.com/photos/bigtallguy/434164568',
//  nicknames: ['Casper']
//  }
//];

var attractionsData = [
  {title: 'Central Park', location: {lat: 40.767852, lng: -73.979694}, category: 'Parks'},
  {title: 'Metropolitan Museum of Art', location: {lat: 40.779437, lng: -73.963244}, category: 'Buildings'},
  {title: 'Prospect Park Zoo', location: {lat: 40.665375, lng: -73.965414}, category: 'Parks'},
  {title: 'Times Square', location: {lat: 40.758895, lng: -73.985131}, category: 'Buildings'},
  {title: 'United Nations', location: {lat: 40.748876, lng: -73.968009}, category: 'Buildings'},
  {title: 'Empire State Building', location: {lat: 40.748541, lng: -73.985758}, category: 'Buildings'}
];

// Class Attraction to hold the observables
var Attraction = function (data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location); // does this need to be observed?
  this.category = ko.observable(data.category);
};

//// Class Cat
//var Cat = function(data) {
//  this.clickCount = ko.observable(data.clickCount);
//  this.name = ko.observable(data.name);
//  this.nicknames = ko.observableArray(data.nicknames);
//  this.title = ko.computed(function() {
//    var title;
//    var clicks = this.clickCount();
//    if(clicks < 5) { title = 'child';
//    } else { title = 'ninja';
//    }
//    return title;
//  }, this);
//};

//// Class ViewModel
//var ViewModel = function(){
//  var self = this;

//  this.cats = ko.observableArray([]);
//  initialCats.forEach(function(cat) {
//    self.cats.push(new Cat(cat));
//  });
//
//  this.currentCat = ko.observable(this.cats()[0]);
//
//  this.setCat = function(clickedCat) {
//    self.currentCat(clickedCat);
//  };
//
//  this.incrementCounter = function() {
//    self.currentCat().clickCount(self.currentCat().clickCount() + 1);
//  };
//};

var ViewModel = function () {
  var self = this;

  // The Menu
  this.showMenu = ko.observable(true);
  this.toggleMenu = function () {
    this.showMenu(!this.showMenu());
    console.log('menu: ' + this.showMenu());
  }.bind(this);

  // Get the list of attractions
  this.locations = ko.observableArray([]);
  attractionsData.forEach(function (attraction) {
    this.locations.push(new Attraction(attraction));
  }.bind(this));

  // Let user choose one place to display
  this.currentAttraction = ko.observable();
  this.setAttraction = function (clicked) {
    this.currentAttraction(clicked);
    // TODO: set current marker
  }.bind(this);

  // Filter the lists based on category
  this.filterOptions = ['All', 'Parks', 'Buildings'];
  this.selectedOption = ko.observable('All');

  // Compute the filtered list based on the filterOptions
  this.filteredList = ko.observableArray([]);

  self.locations().forEach(function (location) {
    console.log('looping through locations');
    if(self.selectedOption() === 'All') {
      console.log('all');
      self.filteredList.push(location);
    } else if (self.selectedOption() === 'Parks' && location.category() === 'Parks') {
      console.log('parks');
      self.filteredList.push(location);
    } else if (self.selectedOption() === 'Buildings' && location.category() === 'Buildings'){
      console.log('buidlings');
      self.filteredList.push(location);
    }
  });

  /**
   * The Map Section
   */

  this.map = null;
  this.markers = [];

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

    this.createMarkers();
    this.showMarkers();
  }; // ends initMap

  // Populates the infowindow when the marker is clicked
  this.createInfoWindow = function (marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      var content = '<div class = "infoWindow">' +
        '<h3 class = "infoHeader">' + marker.title + '</h3>' +
        '</div>';
      infowindow.setContent(content);
      infowindow.open(this.map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function () {
        infowindow.marker = null;
      }.bind(this));
    }
  };

  this.createMarkers = function () {
    // Style the markers
    var defaultIcon = this.makeMarkerIcon('f2c6a2');
    // var highlightedIcon = this.makeMarkerIcon('a2adf2');

    var largeInfowindow = new google.maps.InfoWindow();
    var callCreateInfoWindow = function () {
      this.createInfoWindow(this, largeInfowindow);
    }.bind(this);

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
      // Push the marker to our array of markers.
      this.markers.push(marker);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', callCreateInfoWindow);
    }//ends for loop
  };

  // Show all markers
  this.showMarkers = function showMarkers () {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(this.map);
      bounds.extend(this.markers[i].position);
    }
    this.map.fitBounds(bounds);
  };

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  this.makeMarkerIcon = function makeMarkerIcon (markerColor) {
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
  this.mapError = function mapError () {
    alert ("Google Maps failed to load. Please try again later.");
  };

};

var viewModel = new ViewModel();

// Start the Knockout bindings
ko.applyBindings(viewModel);
