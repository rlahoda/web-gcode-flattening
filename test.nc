(Design File: .Users.rob.web.projects.gcode-surfacing-generator.test.c2d)
(stockMin:0.000in, 0.000in, 0.000in)
(stockMax:20.000in, 10.000in, 1.000in)
(STOCK/BLOCK,20.000, 10.000, 1.000,0.000, 0.000, 0.000)
G90 // set absolute programming - everything is set from a zero point
G20 // set unit
(Move to safe Z to avoid workholding)
G53G0Z-0.197 // G53 is go to machine zero 
(TOOL 10: Surfacing Bit 1.)
(Toolpath: Facing Toolpath 2)
(Facing Toolpath 2 - Pocket)
M05 // spindle stop
(TOOL/MILL,1.000, 0.000, 0.500, 0.00)
M6T10 // change tool to #10
M03S20000 // set RPM
(PREPOSITION FOR RAPID PLUNGE)
G0X0.0000Y0.0000 //rapid move to X 0 and Y 0
Z1.2500 // z at 1.25 (thickness + retract)
G1Z0.9000F125.0 // move while cutting - z to 0.9 (thickness - depth per pass) F -> plunge rate
X20.0000F200.0 // move while cutting to x 20 F -> rate of 200 (feed rate)
Y0.5000 // move y 0.5 -> stepover distance
X0.0000 // move x back to 0 to bring head back across material
Y1.0000
X20.0000
Y1.5000
X0.0000
Y2.0000
X20.0000
Y2.5000
X0.0000
Y3.0000
X20.0000
Y3.5000
X0.0000
Y4.0000
X20.0000
Y4.5000
X0.0000
Y5.0000
X20.0000
Y5.5000
X0.0000
Y6.0000
X20.0000
Y6.5000
X0.0000
Y7.0000
X20.0000
Y7.5000
X0.0000
Y8.0000
X20.0000
Y8.5000
X0.0000
Y9.0000
X20.0000
Y9.5000
X0.0000
Y10.0000
X20.0000
G0Z1.2500
M05
M02
