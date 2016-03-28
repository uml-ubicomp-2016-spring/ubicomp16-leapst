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