var map;
var panorama;
var links;
var calls;

function initMap() {
    var olsen = {lat: 42.6547, lng: -71.3261};
    var sv = new google.maps.StreetViewService();

    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
    //var heading = 0;

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
    });

    panorama.addListener('pov_changed', function() {
        calls = 0;
    });
}

/*Function to change the rotation of the panorama*/
function processRotation(direction, magnitude) {
    calls =+ 1;
    if (calls == 1) {
        if (direction == false) {

            var newHeading = (panorama.pov.heading - magnitude);
	    
	    //Adjust heading to be positive.
            if (newHeading < 0) {
		        newHeading += 360;
            }

	    //Readjust Pov heading.
            panorama.setPov({
		        heading: newHeading,
		        pitch: panorama.pov.pitch
            });
	    
        } else {
            panorama.setPov({
                heading: ((panorama.pov.heading + magnitude) % 360),
                pitch: panorama.pov.pitch
            });
        }
    }
}

/*Adjust the pitch of the panorama.*/
function processPitch(magnitude) {
    var newPitch = panorama.pov.pitch + magnitude;
    if (newPitch < -90 || newPitch > 90){
        return;
    }

    panorama.setPov({
        heading: panorama.pov.heading,
        pitch: newPitch
    })
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

/*This function handles all streetview calls.*/
function processSVData(data, status) {
    if (status === google.maps.StreetViewStatus.OK) {
        var marker = new google.maps.Marker({
            position: data.location.latLng,
            map: map,
            title: data.location.description
        });

	    marker.setMap(null);

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

/*Short code to allow the use of w, a, s, and d to traverse the links on the panorama.*/
//Original code here.
//http://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 65:
            moveLink("left");
            break;
        case 87:
            moveLink("up");
            break;
        case 68:
            moveLink("right");
            break;
        case 83:
            moveLink("down");
            break;
    }
};

/*Main street view code.*/
var previousFrame = null;
var pauseOnGesture = false;
var counter = 0;

/* Variables migrate from leap-map */
var leftHandPrev;
var LEFT_HAND = 0, RIGHT_HAND = 1;
var X = 0, Y = 1, Z = 2;
var stabilizedPalmPositionAtGripForZ = null;
var tid = -1;
var panoIsMoving = false;

/*Continuously update frame.*/
Leap.loop({enableGestures: true}, function(frame) {

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
                            //moveClockwise(10);
                        } else {
                            gestureString = "counterClockwise Circle!";
                            //moveCounterClockwise(10);
                        }
                    }
                    break;
		//Determines the direction the user is swiping in.
                case "swipe":
                    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
		
		    /*Determine what direction is being swiped.*/
                    if (isHorizontal) {
                        if (gesture.direction[0] > 0) {
                            gestureString = "Swipe Right";
			    moveLink("right");
                        } else {
                            gestureString = "Swipe Left";
			    moveLink("left");
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

    // the grabbing controller migrated from leap-map
    if(frame.hands.length > 0 && isGripped(frame.hands[LEFT_HAND])) {
        var leftHand = frame.hands[LEFT_HAND];

        // If there was no previous closed position, capture it and exit
        if(leftHandPrev == null) {
            leftHandPrev = leftHand;
            stabilizedPalmPositionAtGripForZ = leftHand.stabilizedPalmPosition[Z];
            return;
        }

        // Calculate how much the hand moved
        var dX = leftHandPrev.stabilizedPalmPosition[X] - leftHand.stabilizedPalmPosition[X];
        var dY = leftHandPrev.stabilizedPalmPosition[Y] - leftHand.stabilizedPalmPosition[Y];

        var zOffsetFromAtGrip = stabilizedPalmPositionAtGripForZ - leftHand.stabilizedPalmPosition[Z];

        /* we should call a function to change the panorama here */
        if (dX >= 0){
            moveClockwise(dX);
        } else if (dX < 0) {
            moveCounterClockwise(dX);
        }
        
        processPitch(dY);

        if (zOffsetFromAtGrip >= 20 && panoIsMoving == false){
            tid = setInterval(function() { moveLink("up"); }, 500);
            panoIsMoving = true;
        }

        if (zOffsetFromAtGrip < 20){
            clearInterval(tid);
            panoIsMoving = false;
        }

        leftHandPrev = leftHand;

    } else {
        // If the left hand is not in a grab position, clear the last hand position
        if (frame.hands.length > LEFT_HAND && !isGripped(frame.hands[LEFT_HAND]) && leftHandPrev != null) {
            leftHandPrev = null;
            stabilizedPalmPositionAtGripForZ = null;
            clearInterval(tid);
            panoIsMoving = false;


        }

        // if the right hand is not in a grab position, clear the separation
        if (frame.hands.length > RIGHT_HAND && !isGripped(frame.hands[RIGHT_HAND]) && separationStart != null) {
            separationStart = null;
            // this does literally nothing because we are not doing right hand at all
        }
    }
    
    //Check for tilting hand here.
    if(frame.hands.length > 0){
	var farLeft;
	var farRight;
	var middleFing;
	if(frame.hands[0].type == "left"){
	    farLeft = frame.hands[0].pinky;
	    farRight = frame.hands[0].thumb;
	}
	if(frame.hands[0].type == "right"){
	    farRight = frame.hands[0].pinky;
	    farLeft = frame.hands[0].thumb;
	}
	if(frame.hands[0].fingers.length >= 3){
	    middleFing = frame.hands[0].fingers[2];
	}
	var leftPosY = farLeft.stabilizedTipPosition;
	var leftY = leftPosY[1];
	
	var rightPosY = farRight.stabilizedTipPosition;
	var rightY = rightPosY[1];

	var middlePosY = middleFing.stabilizedTipPosition;
	//	console.log("MiddleFinger y pos");
	//	console.log(middlePosY[1]);

	var midY = middlePosY[1];

	var fingerDist = leftY - rightY;

	var tiltUpDist;

	if(frame.hands[0].type == "left"){
	    tiltUpDist = midY - rightY;
	}
	if(frame.hands[0].type == "right"){
	    tiltUpDist = midY - leftY;
	}

	//	console.log("Distance between thumb and pinky.");
	//console.log(fingerDist);

	//	console.log("Distance between thumb and middle finger.");
	//	console.log(tiltUpDist);


	var pov = panorama.getPov();
	if(fingerDist == 0 || tiltUpDist == 0){
	//	    console.log("Hand is level.");
	    //console.log(fingerDist);
	}
	else if(fingerDist > 50){
	//	    console.log("Hand is leaning right.");
	    //console.log(fingerDist);
	    pov.heading += 0.5;
	    panorama.setPov({
		heading: pov.heading,
		pitch: pov.pitch
	    });
	}
	else if(fingerDist < -50){
	//	    console.log("Hand is leaning left.");
	    //console.log(fingerDist);
	    pov.heading -= 0.5;
	    panorama.setPov({
		heading: pov.heading,
		pitch: pov.pitch
	    });

	}
	else if(tiltUpDist > 50){
	    //console.log("Hand is leaning up.");
	    //console.log(tiltUpDist); 
	    pov.pitch += 0.5;
	    panorama.setPov({
		heading: pov.heading,
		pitch: pov.pitch
	    });	    
	}
	else if(tiltUpDist < -50){
	    //console.log("Hand is leaning down.");
	    //console.log(tiltUpDist); 
	    pov.pitch -= 0.5;
	    panorama.setPov({
		heading: pov.heading,
		pitch: pov.pitch
	    });}
    }

    gestureOutput.innerHTML = gestureString;
    previousFrame = frame;
});



/*
 Test funciton that adjusts the StreetWise map.
 */
function moveLink(gestureDirection) {

 var relative_heading;
    var links_relative_headings = [links.length];
    var i;

    //Store our heading withing 0 to 360.
    if(panorama.pov.heading < 0){
      relative_heading = panorama.pov.heading + 360;
    }
    else{
        relative_heading = panorama.pov.heading;
    }

    //Store link angles relative if our heading was 0 and make sure they are between 0 and 360.
    for (i = 0; i < links.length; i++) {
        links_relative_headings[i] = (links[i].heading - relative_heading);
        while(links_relative_headings[i] < 0){
            links_relative_headings[i] = links_relative_headings[i] + 360;
        }
    }
    
    /*Recognize and act according* to the direction of movement.*/
    if (gestureDirection == "up"){
        for(i = 0; i < links.length; i++){
            if ( (0 <= links_relative_headings[i] && links_relative_headings[i] <= 45) ||
                 (315 < links_relative_headings[i] && links_relative_headings[i] <= 360 )){
                //console.log("Go north");
                processSVGestureData(links[i]);
                break;
                //first link that resides in the direction we are facing (relative north)
            }
        }
    }
    if (gestureDirection == "down"){
        for(i = 0; i < links.length; i++){
            if ( 135 < links_relative_headings[i] && links_relative_headings[i] <= 225){
                //console.log("Go south");
                processSVGestureData(links[i]);
                break;
                //first link that resides behind where we are facing (relative south)
            }
        }
    }
    if (gestureDirection == "right"){
        for(i = 0; i < links.length; i++){
            if ( 45 < links_relative_headings[i] && links_relative_headings[i] <= 135){
                //console.log("Go west");
                processSVGestureData(links[i]);
                break;
                //first link that resides left to where we are facing (relative west)
            }
        }
    }
    if (gestureDirection == "left"){
        for(i = 0; i < links.length; i++){
            if ( 225 < links_relative_headings[i] && links_relative_headings[i] <= 315){
                console.log("Go east");
                processSVGestureData(links[i]);
                break;
                //first link that resides right to where we are facing (relative east)
            }
        }
    }
}

/*Handles clockwise movement based on a given magnitude.*/
function moveClockwise(magnitude) {
    if (isNaN(magnitude)){
        return;
    }
    processRotation(true, magnitude);
}

/*Handles counter-clockwise movement based on a given magnitude.*/
function moveCounterClockwise(magnitude) {
    if (isNaN(magnitude)){
        return;
    }
    processRotation(false, 0 - magnitude);
}

/*Returns if a hand is gripping.*/
function isGripped(hand) {
    return hand.grabStrength == 1.0;
}

initMap();