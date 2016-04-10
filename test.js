var map;
var panorama;
var links;
var calls;

function initMap() {
    var olsen = {lat: 42.6547, lng: -71.3261};
    var sv = new google.maps.StreetViewService();
    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
    var heading = 0;

    // Set up the map.
    map = new google.maps.Map(document.getElementById('map'), {
        center: olsen,
        zoom: 16,
        streetViewControl: false
    });

    // Set the initial Street View camera to the center of the map
    sv.getPanorama({location: olsen, radius: 50}, processSVData);

    var myLatLng = new google.maps.LatLng(37.88,-122.24);
    var marker = new google.maps.Marker({position: myLatLng, map: map});
    marker.setMap(map);

    // Look for a nearby Street View panorama when the map is clicked.
    // getPanoramaByLocation will return the nearest pano when the
    // given radius is 50 meters or less.
    map.addListener('click', function(event) {
        sv.getPanorama({location: event.latLng, radius: 50}, processSVData);
    });

    panorama.addListener('position_changed', function() {
        var positionCell = document.getElementById('position-cell');
        positionCell.firstChild.nodeValue = panorama.getPosition() + '';
        map.setCenter(panorama.getPosition());
        marker.setPosition(panorama.getPosition());

    });

    panorama.addListener('links_changed', function() {
        links = panorama.getLinks();
        var i; 
        //console.log(panorama.pov.heading);
        for (i = 0; i < links.length; i++) {
            //console.log(links[i].heading);
        }
    });

    panorama.addListener('pov_changed', function() {
        calls = 0;
    });

}

function processRotation(direction) {
    calls =+ 1;


    if (calls == 1) {
        if (direction == false) {

        var newHeading = (panorama.pov.heading - 20);

        if (newHeading < 0) {
            newHeading += 360;
        }

        panorama.setPov({
            heading: newHeading,
            pitch: 0
        });

        } else {
            panorama.setPov({
                heading: ((panorama.pov.heading + 20) % 360),
                pitch: 0
            });
        }
    }
   

     
}


/*Function to adjust the Streetwise data.*/
function processSVGestureData(linkData) {
    panorama.setPano(linkData.pano);

    panorama.setPov({
        heading: linkData.heading, 
        pitch: 0
    });
    panorama.setVisible(true);
}


function processSVData(data, status) {
    if (status === google.maps.StreetViewStatus.OK) {
        var marker = new google.maps.Marker({
            position: data.location.latLng,
            map: map,
            title: data.location.description
        });

        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });
        panorama.setVisible(true);


        marker.addListener('click', function() {
            var markerPanoID = data.location.pano;
            // Set the Pano to use the passed panoID.
            panorama.setPano(markerPanoID);
            panorama.setPov({
                heading: 270,
                pitch: 0
            });
            panorama.setVisible(true);
        });
    } else {
        console.error('Street View data not found for this location.');
    }
}


/*Main street view code.*/
var previousFrame = null;
var pauseOnGesture = false;
var counter = 0;

var controllerOptions = {enableGestures: true};

/*Continuously update frame.*/
Leap.loop(controllerOptions, function(frame) {

    /*
     A simple frame blocking mechanism for testing. 
     Delays the frame input so that the user can respond better.
     */
    if (pauseOnGesture == true) {
        if (counter == 125) {
            counter = 0;
            pauseOnGesture = false;
        } else {
            counter++;
            return;
        }

    }

    var gestureOutput = document.getElementById("gestureData");

    var gestureString;
    
    //Check that a gesture has been read and is valid.
    if (frame.gestures.length > 0 && frame.valid) {
        pauseOnGesture = true;

        for (var i = 0; i < frame.gestures.length; i++) {
            var gesture = frame.gestures[i];

	    /*Determine which gesture the user is providing.*/
            switch (gesture.type) {
                case "circle":
                    var clockwise = false;
                    var pointableID = gesture.pointableIds[0];
                    var direction = frame.pointable(pointableID).direction;
                    if (direction != null) {
                        var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                        if (dotProduct  >=  0) {
                            clockwise = true;
                            gestureString = "clockwise circle";
                            moveClockwise();
                        } else {
                            gestureString = "counterClockwise Circle!";
                            moveCounterClockwise();
                        }
                    }
                    break;
                case "swipe":
                    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
		
		    /*Determine what direction is being swiped.*/
                    if (isHorizontal) {
                        if (gesture.direction[0] > 0) {
                            gestureString = "Swipe Right";
                        } else {
                            gestureString = "Swipe Left";
                        }
                    } else {
                        if (gesture.direction[1] > 0) {
                            gestureString = "Swipe Up";
			    //Call function to affect StreetWise.
                            moveLink("up");
                        } else {
                            gestureString = "Swipe Down";
                            moveLink("down");
                        }
                    }
                    break;
            }
        }
    }
    gestureOutput.innerHTML = gestureString;
    previousFrame = frame;
});



/*
 Test funciton that adjusts the StreetWise map.
 */
function moveLink(gestureDirection) {


    if (gestureDirection == "up") {
        var i;
        var tempCurrentHeading;

        if (panorama.pov.heading < 0) {
            tempCurrentHeading = panorama.pov.heading + 360;
        } else {
            tempCurrentHeading = panorama.pov.heading;
        }


        var tempHeading;
        var upperBound = tempCurrentHeading + 20;
        var lowerBound = tempCurrentHeading - 20;
        console.log("panorama.pov.heading: " + panorama.pov.heading);
        console.log("tempCurrentHeading: " + tempCurrentHeading);
        console.log("upperBound: " + upperBound);
        console.log("lowerBound: " + lowerBound);
        for (i = 0; i < links.length; i++) {
            if (links[i].heading < 0) {
                tempHeading = links[i].heading + 360;

                if (tempHeading >= lowerBound && tempHeading <= upperBound) {
                    processSVGestureData(links[i]);
                    break;
                }

            } else {
                //console.log(links[i].heading + 180);
            }
            
        } 
    }


}

function moveClockwise() {
    processRotation(true);
}

function moveCounterClockwise() {
    processRotation(false);
}
