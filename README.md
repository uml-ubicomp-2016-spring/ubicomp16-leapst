#Project name: LeapStreet

#Members: 
Michael Forsyth, Nicholas Forsyth, David Rocca, YuetLong Leung  

#By 3/28/16:
   *Get one gesture linked to map motion.
   *Make sure that there is one function for the map movement.
   *Phone Video demo and list of features accomplished

#Done: 3/26/16
   *Integrated communication from the leap motion to Google Streetwise
   *Registered the swipe up motion to moving the streetview panorama to the first link
   *Added a delay between gestures to allow a better response time
   *Video of current progress recorded by Mike

#By 4/4/2016
   *Created additional gestures for mapping to panorama links
   *Gestures: Swipe up-down, counter-clock and clock wise
   *Added a heading match feature which changes perspective to match motion down a streetview link
   *To do:correlate swipes to links in relative position, (left swipe goes left)



# What's done

Progress: 

1. LeapMotion can talk to StreetView
   * Map swipe up to access first link on StreetView and move down.
       * Add a delay in between gestures to allow better response time
   * Turns 45 degrees using counter-clockwise and clockwise gestures.
   * Maintains heading when it moves down a link.
   * Map swipe up accesses first link on StreetView and updates the panorama to it.
   * Added a delay in between gestures to allow better response time

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

