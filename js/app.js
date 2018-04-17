var map;

locations = [{

        title: 'King Khaled airport',
        location: {
            lat: 24.960788,
            lng: 46.703969
        }
    },
    {
        title: 'four seasons',
        location: {
            lat: 24.711389,
            lng: 46.674278
        }
    },
    {
        title: 'Alhabib hospital',
        location: {
            lat: 24.719234,
            lng: 46.657133
        }
    },
    {
        title: 'The Royal Court',
        location: {
            lat: 24.659654,
            lng: 46.637392
        }
    },
    {
        title: 'Alhukair land',
        location: {
            lat: 24.764456,
            lng: 46.737294
        }
    }
];



function initMap() {
    console.log('initMap');

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.710,
            lng: 46.663
        },
        zoom: 10

    });
    ko.applyBindings(new viewModel());

}

function myMarker(mark) {
    var self = this;
    this.infowindow = new google.maps.InfoWindow();
    this.bounds = new google.maps.LatLngBounds();

    var position = mark.location;
    var title = mark.title;
    // Create a marker per location, and put into markers array.

    this.marker = new google.maps.Marker({
        position: position,
        title: title,
        map: map
    });

    function toggleBounce() {
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);

    }

    function populateInfoWindow() {
        // Check to make sure the infowindow is not already opened on this marker.

        if (self.infowindow.marker != self.marker) {


            var foursquare_url = "https://api.foursquare.com/v2/venues/search?ll=";
            var param = {
                limit: 1,
                v: 20170601,
                client_id: "YNDU5NPUGZCBGH5KM4RG5HVXNIWRN4WBL3CSY1KRZC0Q1X0C",
                client_secret: "KNPQ1QPT41WFFZUF5BPCRSZL11IJHQA5BV40FUFZYPNH2M54",
                ll: self.marker.position.lat() + ',' + self.marker.position.lng()
            };
            $.getJSON(foursquare_url, param, function(json) {
                var venue = json.response.venues[0];
                var placename = venue.name;
                var url = venue.url;

                if (typeof url === 'undefined') {
                    url = "";
                }
                var here_now = venue.hereNow.count;
                var checkin_count = venue.stats.checkinsCount;
                var address = venue.location.address;
                // content = venue + placename+ url;
                self.infowindow.setContent('<p> ' + placename + '</p>' + '<p>' + url + '</p>');
                self.infowindow.open(map, self.marker);
            }).error(function() {
                self.infowindow.setContent('<p> Error... no data</p>');
                self.infowindow.open(map, self.marker);
            });

            self.infowindow.open(map, self.marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            self.infowindow.addListener('closeclick', function() {
                self.infowindow.setMarker = null;

            });

        }
    }



    this.marker.addListener('click', function() {
        toggleBounce();
        populateInfoWindow();
    });
    this.bounds.extend(this.marker.position);

    // // Extend the boundaries of the map for each marker
    //      map.fitBounds(this.bounds);

    this.fireClick = function(curMarker) {
        google.maps.event.trigger(curMarker.marker, 'click');
    };

}

var viewModel = function() {
    var self = this;
    this.markers = ko.observableArray([]);
    locations.forEach(function(mark) {
        self.markers.push(new myMarker(mark));
    });

    this.query = ko.observable('');

    this.queryMarkers = ko.computed(function() {
        var filter = self.query().toLowerCase();
        if (!filter) {
            self.markers().forEach(function(marker) {
                marker.marker.setVisible(true);
            });
            return self.markers();
        } else {
            return ko.utils.arrayFilter(self.markers(), function(marker) {
                console.dir(marker);
                var string = marker.marker.title.toLowerCase();
                var res = (string.search(filter) >= 0);
                marker.marker.setVisible(res);
                return res;
            });
        }
    });


};

function errorHandling() {
    alert("Google Maps has failed to load. ");
}
