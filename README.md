#Project name: LeapStreet

#Members: 
Michael Forsyth, Nicholas Forsyth, David Rocca, YuetLong Leung  

#By 3/28/16:
   * Get one gesture linked to map motion. <br />
   * Make sure that there is one function for the map movement. <br />
   * Phone Video demo and list of features accomplished. <br />

#Done: 3/26/16
   * Integrated communication from the leap motion to Google Streetwise <br />
   * Registered the swipe up motion to moving the streetview panorama to the first link <br />
   * Added a delay between gestures to allow a better response time <br />
   * Video of current progress recorded by Mike <br />

#By 4/4/2016
   * Created additional gestures for mapping to panorama links <br />
   * Gestures: Swipe up-down, counter-clock and clock wise <br />
   * Added a heading match feature which changes perspective to match motion down a streetview link <br />
   * To do:correlate swipes to links in relative position, (left swipe goes left) <br />

#By 4/11/2016
   * Create swipe left and swipe right functions to pick links in the correct local direction. <br />
   * Adjust rotation so that it is more constant. <br />
   * Potentially add new gestures for slant left and right. <br />
   * Make ppt and demo for presentation in class. <br />

#Done 4/9/2016
   * Adjusted roatation so that it is more constant. <br />
   * Learned that there are negative rotations in streetview and to do math on them it is easier to add 360 degrees if negative. <br />
   * Learned about tilt in streetview and might use them for tilting. <br /> 

#Progress: 

LeapMotion can talk to StreetView <br /> 
   * Recognize clockwise, counter-clockwise, and swipe: up left right down. <br /> 
       * Add a delay in between gestures to allow better response time <br /> 
   * Turns 5 degrees using counter-clockwise and clockwise gestures to make it more visually consistant. <br /> 
       * Adjust any negative angle to positive between 0 and 360. <br /> 
   * Maintains heading when it moves along a link. <br /> 
   * Map swipe up accesses first link on StreetView and updates the panorama to it. <br /> 
   * Map swipe down accesses rear link on StreetView and updates the panorama to face backwards. <br /> 
   * Added code to better utilize angle of pano in streetview. <br />

# Ideas

A few things to keep in mind:

Fingers -- that is a record in the frame data set with a particular ID -- are prone to disappear as the scanner unrecognizes/recongnizes them.
You have to be careful to discriminate between motions that the user is likely to do to navigate and those they are doing to select/activate. IN a sense you have to detect the "not gesture state" as well as the gesture state.
Using directional vectors is useful. both the direction the finger is pointing and the direction the finger is moving. I've found it is useful to average (with noise suppression) the fingers' position over the last 6 or so frames and use it to make your own finger motion vector to calculate the motion of the finger. Comparing that to the orientation vector of the finger can determine whether it is poking straight or sweeping to the side.
Using the frontmost few fingers is a good way to filter out the thumb and pinkies.
Provide a visual cue in the form of a cursor as the user generates a gesture to let them "balk out" of a gesture they don't want.
Provide a cool-down time to avoid inadvertently "Double Gesturing". This should include the time it takes to execute whatever effect you want the gesture to make.
Make sure to lock the focus of your gesture down when it has started to a single finger. That is you don't want to have "start-poke: F1 .... Start-poke: F2 ... end-poke: F1 .. end-poke: F2" and generate two machine-gun gestures .
Avoid filtering gestures by z-position; its pretty difficult for users to really know how "deep" their hands are. relative Z-motion is fine, but absolute position is not a great hook.
Limit gesture starts to well within the detection zone; you don't want them "brushing out" of range mid gesture.
Detecting when fingers touch each other (pinch) is a bad route, as detecting fingerness of a closed finger loop is problematic at this point. You can detect a pinch, but make sure that you end the gesture while the fingers aren't quite touching.

