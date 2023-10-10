# RPN-TS (How to generate JS source maps)

RPN-TS stands for Reverse Polish Notation in TypeScript.\
The purpose of this project is to show how to generate source maps\
for your own scripting language that compiles (transpiles) to JavaScript (JS).

RPN-TS compiles source code of the 'toy language' RPN to JS,\
while also generating source map files (*.map).\
After this compilation, you can start a JS output file in a browser in debug mode\
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

Now start the HTTP server on port 3000 this script:
(On Windows, use Git Bash to open it)

	startWebServer.sh

## Installing dependencies

With VSCode, open the project workspace file "rpn-ts.code-workspace".\
First install the npm dependencies with this command:

	npm install

## Running the RPN compiler

In VSCode, open the file "web/rpn/test.rpn" to see the RPN source code that will be transpiled to JS.\
For information on how Reverse Polish Notation works, look here: \
https://en.wikipedia.org/wiki/Reverse_Polish_notation


Now click the VSCode menu "Run" > "Start debugging".\
Now the `web/rpn/test.rpn` source code will be compiled to `test.js` with source map `test.js.map` in the same folder.\
The default browser will be opened starting the transpiled file `test.js` and produce this result:

	RPN test output:
	4

Jay!

# Inspecting compiled RPN code

Open the generated file "web/rpn/test.js" to see the compiled JS code.\
The script first imports the file "../rpn-vm.js" that implements the RPN "virtual machine".

Also notice that the file "web/rpn/test.js.map" was generated.\
This file contains a mapping between the RPN source code and the transpiled JS code.\
You can examine the file "src/Compiler.ts" to see how generation of the map file works.

More information on the source map file format can be found here:\
https://sourcemaps.info/spec.html

## Debugging RPN code in a web browser

Now the final step, this is what it's all about.\
Open the development tools in your browser by pressing the [F12] key.\
Under the "Sources" menu, you should be able to open the file "rpn/test.rpn":

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

I hope this project helped you to better understand JS source maps,\
so you can implement them for your own JS transpiled scripting language.\
Feedback for improvements is welcome.
