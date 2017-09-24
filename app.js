/* global ko, document, google */

/**
 * The Menu Section
 */
var openbtn = document.getElementsByClassName('openbtn');
openbtn[0].addEventListener('click', openNav);
var closebtn = document.getElementsByClassName('closebtn');
closebtn[0].addEventListener('click', closeNav);

function openNav() {
  document.getElementById('panel').className = "sidenav show";
}

function closeNav() {
  document.getElementById('panel').className = "sidenav hide";
}

/**
 * The ViewModel Section
 */
//var initialCats = [{
//  clickCount: 0,
//  name: 'Tabby',
//  imgSrc: 'img/434164568_fea0ad4013_z.jpg',
//  imgAttribution: 'https:www.flickr.com/photos/bigtallguy/434164568',
//  nicknames: ['Casper']
//  },{
//  clickCount: 0,
//  name: 'Babi',
//  imgSrc: 'img/22252709_010df3379e_z.jpg',
//  imgAttribution: 'https:www.flickr.com/photos/xshamx/4154543904',
//  nicknames: ['Bami']
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
var Attraction = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location); // does this need to be observed?
  this.category = ko.observable(data.category);
};

//// Class Cat
//var Cat = function(data) {
//  this.clickCount = ko.observable(data.clickCount);
//  this.name = ko.observable(data.name);
//  this.imgSrc = ko.observable(data.imgSrc);
//  this.imgAttribution = ko.observable(data.imgAttribution);
//  this.nicknames = ko.observableArray(data.nicknames);
//  this.title = ko.computed(function() {
//    var title;
//    var clicks = this.clickCount();
//    if(clicks < 5) { title = 'child';
//    } else if (clicks < 10) { title = 'teen';
//    } else if (clicks < 15 ) { title = 'adult';
//    } else { title = 'ninja';
//    }
//    return title;
//  }, this);
//};

//// Class ViewModel
//var ViewModel = function(){
//  // self gets assigned to the current scope of this,
//  // so when it's used inside an anonymouse function, it refers to that
//  var self = this;
//
//  // previously octopus getCats()
//  this.cats = ko.observableArray([]);
//  // see global variable array holding all cat objects
//  initialCats.forEach(function(cat) {
//    self.cats.push(new Cat(cat));   // use self, which use outer scope this
//  });
//
//  // initialize first currentCat
//  this.currentCat = ko.observable(this.cats()[0]);
//
//  // previously octopus setCurrentCat()
//  this.setCat = function(clickedCat) {
//    self.currentCat(clickedCat);
//  };
//
//  // previous octopus.incrementCounter()
//  this.incrementCounter = function() {
//    // clickCount is a property of Cat, not ViewModel
//    self.currentCat().clickCount(self.currentCat().clickCount() + 1);
//  };
//};

var ViewModel = function() {
  var self = this;

  // Get the list of attractions
  this.locations = ko.observableArray([]);
  attractionsData.forEach(function(attraction) {
    self.locations.push(new Attraction(attraction));
  });

  // this.currentAttraction = ko.observable(this.locations()[0]);
  this.currentAttraction = ko.observable();

  this.setAttraction = function(clicked) {
    self.currentAttraction(clicked);
    //console.log(self.currentAttraction());
  };
};

// Start the Knockout bindings
ko.applyBindings(new ViewModel());

/**
 * The Map Section
 */

var map;
var markers = [];

function initMap() {
  // Map style credit: https://snazzymaps.com/style/42/apple-maps-esque
  var styles = [{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [{ "color": "#f7f1df" }]
  }, {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#d0e3b4" }]
  }, {
    "featureType": "landscape.natural.terrain",
    "elementType": "geometry",
    "stylers": [{ "visibility": "off" }]
  }, {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }, {
    "featureType": "poi.business",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  }, {
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [{ "color": "#fbd3da" }]
  }, {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#bde6ab" }]
  }, {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "visibility": "off" }]
  }, {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }, {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffe15f" }]
  }, {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#efd151" }]
  }, {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  }, {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "black" }]
  }, {
    "featureType": "transit.station.airport",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#cfb2db" }]
  }, {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#a2daf2" }]
  }];

  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.714728, lng: -73.998672},
    zoom: 12,
    styles: styles,
    mapTypeControl: false
  });

//  var locations = [
//    {title: 'Central Park', location: {lat: 40.767852, lng: -73.979694}},
//    {title: 'Metropolitan Museum of Art', location: {lat: 40.779437, lng: -73.963244}},
//    {title: 'Prospect Park Zoo', location: {lat: 40.665375, lng: -73.965414}},
//    {title: 'Times Square', location: {lat: 40.758895, lng: -73.985131}},
//    {title: 'United Nations', location: {lat: 40.748876, lng: -73.968009}},
//    {title: 'Empire State Building', location: {lat: 40.748541, lng: -73.985758}}
//  ];

  // Style the markers
  var defaultIcon = makeMarkerIcon('f2c6a2');
  var highlightedIcon = makeMarkerIcon('a2adf2');

  var largeInfowindow = new google.maps.InfoWindow();

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
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    // somehow this mouseover & mouseout is causing a bug with the knockout bind
    // for curentAttraction :(
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
//    marker.addListener('mouseover', function() {
//      this.setIcon(highlightedIcon);
//    });
//    marker.addListener('mouseout', function() {
//      this.setIcon(defaultIcon);
//    });
  }

  showListings();
//  document.getElementById('show-listings').addEventListener('click', showListings);
//  document.getElementById('hide-listings').addEventListener('click', hideListings);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
//function hideListings() {
//  for (var i = 0; i < markers.length; i++) {
//    markers[i].setMap(null);
//  }
//}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// Google Maps API error handler
function mapError() {
  alert("Google Maps failed to load. Please try again later.");
}
