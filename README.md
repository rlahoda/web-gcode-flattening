# web-gcode-flattening
Gcode flattening web app


This readme is just a bunch of notes. If I get around to it, I'll make it into something understandable. 





snake_case for variables and functions
PascalCase for types and traits
SCREAMING_SNAKE_CASE for constants and static variables


 1 in = 25.4 mm
 0.0393700787402 inches in one millimeter


 G20 - units are in inches
 G21 - units are in mm


x-length: 20in
y-length: 10in
thickness: 1in
retract: 0.25in
zero height from bottom
zero point bottom left

box x length 20in
box y length 10in

bit diameter: 1in
stepover: 0.5in
depth per pass: 0.1in
plunge rate: 125
feed rate: 200
rpm: 20000
max depth 0.1in
angle: 0




 - user selects unit in interface
 - no conversion will be needed because it can use the correct gcode for the unit selected

So here's a couple links to what is supported:
https://cncphilosophy.com/grbl-g-code-commands-list/
https://deepwiki.com/grbl/grbl/2.1-supported-g-codes

And some helpful links for general reference for g and m codes
https://cnccode.com/2025/07/29/the-complete-g-code-and-m-code-reference-guide-for-cnc-programming-2025-edition/
https://www.machinistguides.com/g-codes/
https://www.machinistguides.com/m-codes/

Sequence:

(stuff happens that i'm not sure yet)

G90 - set absolute location programming
G20/G21 - set units (20-in, 21-mm)
G53G0Z-0.197 - Move to home, move quickly (G0) to Z-0.197
M05 - stop the spindle (precautionary)
M6T[tool number] - Tool change to Tool #[chosen]
M03S[rpm value] - set the RPM to desired speed
G0X[x.xxxx]Y[x.xxxx] - move to set X and Y start points (if using different start points like center-left or center, will need to do some math to figure out where this X and Y value should be) this sets the head in motion
Z[thickness + retract height] - move the head quickly to the retract height above the material
G1Z[thickness - depth of cut]F[plunge rate] - move while cutting down to the start depth of cut
X[start point + x length]F[feed rate] - move while cutting along the x axis (if doing at 90 deg angle, this would be Y instead)
Y[start point + stepover] - head has reached the end of the X movement so now moves up the Y the stepover amount 
X[start point] - head moves back to start point
Y[start point + stepover + stepover]

... loop through X to length, Y stepover, X back to start, Y stepover...
...At end of everything->

G0Z[thickness + retract height] - move head up away from material
M05 - stop spindle
M02 - program end M30 is program end with resetting to beginning








     /**
     * values: 
     * x length
     * y length
     * depth of cut
     * bit diameter
     * stepover
     * xy feed rate
     * z feed rate
     * z pass depth
     * safe z height?
     * perimeter margin
     * zero point
     * 
     * start: read values in app already
     * then: allow imperial to metric conversion
     * then: read external file with params
     * then: GUI web interface
     * then: web interface touch friendly
     * ideal: can directly talk to GRBL and run machine without having to export a file and import it
     * 
     */

     // have sidecar json file that can be generated with bit settings and read in at run time





     For the final one, you would need to:

    Remove the end-of-program command (M02)
    Add movement command(s) to position the spindle. You probably want to retract first, then move to your destination. Something like:


  

  
G53G0Z-1
G53G0Y-1
G53G0X-1

This example first retracts on Z, then moves straight back, then move all the way right - i.e., similar to the current behaviour. You would want to determine how many different moves you want to make.

You could combine all three moves into one - G53G0X-1Y-1Z-1. This will move in a straight line from the current position to the destination.

The G53 means to use machine co-ordinates. The G0 is a rapid move. In machine co-ordinates, the upp back right corner is considered (0,0,0) location. So, all movement on the machine is into negative numbers. When the Z is at very top of travel, that’s Z=0. Moving down means subtracting values, so all valid Z machine co-ordinates are negative. Same with X and Y.

Without the G53, you are moving to somewhere relative to your zeros that you set for the job. That could be anywhere on the machine, so you need to use machine co-ordinates to specify a specific point on the machine.[text](../gcode-surfacing-generator/test.c2d) [text](../gcode-surfacing-generator/test.nc) [text](../gcode-surfacing-generator/test2.nc) [text](../gcode-surfacing-generator/test3.nc)