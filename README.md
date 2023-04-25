# RPN-TS (How to generate JS source maps)

RPN-TS stands for Reverse Polish Notation in TypeScript.\
The purpose of this project is to show how to generate source maps\
for your own scripting language that transpiles (compiles) to JavaScript (JS).

RPN-TS transpiles source code of the 'toy language' RPN to JS,\
while also generating source map files (*.map).\
After this transpilation, you can start a JS output file in a browser in debug mode\
and step through RPN source line by line, while JS is executing underneath.

The RPN compiler and parser are hand-implemented in TypeScript.\
The npm package "source-map" is used to generate the map files.

## Origin

RPN-TS is a complete rewrite of Nick Fitzgerald's (@fitzgen) RPN-JS project,\
that can be found here: https://github.com/fitzgen/rpn-js

Major changes compared to the original project are:

	- Set up a workspace for Visual Studio Code.
	- Converted JavaScript to strict TypeScript,
	  fully object oriented, class based with esNext modules.
	- Removed dependency on the npm package "jison"
  	  by hand-implementing a simple compiler and parser for RPN.
	  LEX, BNF and AST constructs could then also be removed.
	- Moved the RPN "virtual machine" to a separate JS file
 	  and extended its functionality to prevent repeated code in JS transpilation.
	- Converted RPN variable storage from the DOM "window" object to real JS variables.
	- Made the RPN language line based, removing the need for semicolons at line ends.

# Getting Started

## Development tools

### Visual Studio Code

This project is pre-configured for use with Visual Studio Code (VSCode).\
It can be downloaded here: https://code.visualstudio.com/download

### Node.js

The RPN-TS compiler is based on Node.js\
It can be downloaded here: https://nodejs.org/en/download

### HTTP server

To run and debug the transpiled JS code, you first need to install a web server.\
(Just launching the file "web/index.html" won't work because of CORS restrictions)\
Any static web server will do. We'll use one implemented in Node.js.\
To install it globally run this on a command line:

	npm install --global http-server

Now start the HTTP server on port 3000 with one of these scripts:

	startWebServer   		(Linux, Mac)
	startWebServer.cmd		(Windows)

## Running the RPN compiler

With VSCode, open the project workspace file "rpn-ts.code-workspace".\
First install de npm dependencies with this command:

	npm install

Open the file "web/test.rpn" to see the RPN source code that will be transpiled to JS.\
For information on how Reverse Polish Notation works, look here: \
https://en.wikipedia.org/wiki/Reverse_Polish_notation

Now click the VSCode menu "Run" > "Start debugging".\
Open the generated file "web/test.js" to see the transpiled JS code.\
This code first imports the file "Rpn.js" that implements the RPN "virtual machine".

Also notice that the file "web/test.js.map" was generated.\
This file contains a mapping between the RPN source code and the transpiled JS code.\
You can examine the file "src/Compiler.ts" to see how generation of the map file works.

More information on the source map file format can be found here:\
https://sourcemaps.info/spec.html

## Running the code in a web browser

Open your web browser and type this in the address bar:\
(Remember we started the HTTP server on port 3000)

	localhost:3000

The default web page "index.html" will will now be opened\
starting the transpiled file "test.js" and produce the this result:

	RPN test output:
	4

Jay!

## Debugging RPN code in a web browser

Now the final step, this is what it's all about.\
Open the development tools in your browser by pressing the [F12] key.\
Under the "Sources" menu, you should be able to open the file "test.rpn":

	a 8 =
	b 3 =
	c a b 1 - / =
	c 1 print

Now you can set breakpoints on every line by clicking on the left of it.\
You can then also set breakpoints on specific statements within these lines.

Press the page refresh button in your browser to re-run the script.\
Now the browser should stop at your first breakpoint set.\
You can step thought individual RPN statements by pressing [F10].\
You can also step into the JS RPN virtual machine by pressing [F11].\
Pretty cool, no?

# Conclusion

I hope this project helped you to better understand JS sources maps,\
so you can implement them for your own JS transpiled scripting language.\
Feedback for improvements are welcome.
