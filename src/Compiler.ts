import { Parser } from "./Parser";

import { SourceNode } from "source-map";
import * as fs from "fs";

export class Compiler
{
	parser!: Parser;
	sourceFilename!: string;

	static rpnExtension = ".rpn";
	static operatorMap = new Map( [
		[ "+", "add" ],
		[ "-", "subtract" ],
		[ "*", "multiply" ],
		[ "/", "divide" ]
	] );

	compileFiles( sourcePaths: string[] )
	{
		for( let sourcePath of sourcePaths )
			this.compileFile( sourcePath );
	}

	compileFile( sourcePath: string )
	{
		let baseIndex = sourcePath.lastIndexOf( '/' );
		let sourceFolder = baseIndex < 0 ? './' : sourcePath.substring( 0, baseIndex + 1 );

		let sourceFilename = sourcePath.substring( baseIndex + 1 );
		this.sourceFilename = sourceFilename;

		let codeFilename =
			sourceFilename.toLowerCase().endsWith( Compiler.rpnExtension ) ?
			sourceFilename.slice( 0, - Compiler.rpnExtension.length ) + ".js" :
			sourceFilename;
		let codePath = sourceFolder + codeFilename;

		let mapFilename = codeFilename + ".map";
		let mapPath = sourceFolder + mapFilename;

		console.log( 'RPN-TS: Compiling: "' + sourcePath +'" to: "' + codePath + '" and: "' + mapPath + '"' );

		let source = fs.readFileSync( sourcePath ).toString();
		let rootNode = this.compileSource( source );
		// codeWithSourceMap interface: { code: String, map: SourceMapGenerator }
		let codeWithSourceMap = rootNode.toStringWithSourceMap( { file: mapFilename } );

		// We must add the //# sourceMappingURL comment directive
		// so that the browser’s debugger knows where to find the source map.
		codeWithSourceMap.code += "\n//# sourceMappingURL=" + mapFilename + "\n";

		fs.writeFileSync( codePath, codeWithSourceMap.code );
		fs.writeFileSync( mapPath, codeWithSourceMap.map.toString() );
	}

	compileSource( source: string ): SourceNode
	{
		let rootNode = new SourceNode( null, null, null, this.compileImport() );

		this.parser = new Parser( source );
		while( !this.parser.atEnd() ) {
			rootNode.add( this.compileExpression() );
			this.parseNewline();
		}

		return rootNode;
	};

	compileImport(): SourceNode
	{
		return new SourceNode( null, null, null, "" )
			.add( "import { Rpn } from '../rpn-vm.js';\n" )
			.add( "let rpn = new Rpn();\n" );
	}

	// An expression can be a value or a (nested) operator with 2 arguments.
	// E.g.: RPN source: "c a b 1 - / =" evaluates as JS source: "c = a / ( b - 1 )"
	// So, if a == 8 and b == 3 then resulting c == 4.

	compileExpression(): SourceNode
	{
		let left = this.compileValue();
		let term = this.parser.peekTerm();

		if( term == "print" )
			return this.compilePrint( left );

		if( !this.isValue( term ) )
			return left;

		let right = this.compileExpression();

		return this.compileOperator( left, right );
	}

	compileValue(): SourceNode
	{
		let value = this.parser.nextTerm();
		if( !this.isValue( value ) )
			this.error( "Expected value, got: " + value );

		return this.compilePush( value );
	}

	// Print is a single argument operator

	compilePrint( left: SourceNode ): SourceNode
	{
		let operator = this.parser.nextTerm();
		if( operator != "print" )
			this.error( "Print expected, got: " + operator );

		let source = "rpn.print();\n";
		return this.sourceNode( "", operator ).add( left ).add( source );
	}

	compileOperator( left: SourceNode, right: SourceNode ): SourceNode
	{
		let operator = this.parser.nextTerm();
		if( operator == '=' )
			return this.compileAssignment( left, right );

		let mappedOperator = Compiler.operatorMap.get( operator );
		if( !mappedOperator )
			this.error( "Illegal operator: " + operator );

		let source = "rpn." + <string> mappedOperator + "();\n";
		return this.sourceNode( "", operator ).add( left ).add( right ).add( source );
	}

	compileAssignment( variable: SourceNode, value: SourceNode ): SourceNode
	{
		if( !this.isVariable( variable.name ) )
			this.error( "Illegal variable name for assignment: " + variable.name );

		return this.sourceNode( "", variable.name + "=" )
			.add( value )
			.add( "var " + variable.name + " = rpn.pop();\n" );
	}

	compilePush( value: string ): SourceNode
	{
		return this.sourceNode( "rpn.push( " + value + " );\n", value );
	}

	sourceNode( source: string, name: string ): SourceNode
	{
		let node = new SourceNode( this.parser.startPosition.line, this.parser.startPosition.column, this.sourceFilename, source, name );
		this.parser.updateStartPosition();
		return node;
	};

	isValue( value: string ): boolean
	{
		return this.isNumber( value ) || this.isVariable( value );
	}

	isVariable( value: string ): boolean
	{
		if( value == 'print' )
			return false;

		let code = value.charCodeAt( 0 );
		return ( code >= 65 && code <= 90 ) || ( code >= 97 && code <= 122 );
	}

	isNumber( value: string ): boolean
	{
		let code = value.charCodeAt( 0 );
		return code >= 48 && code <= 57;
	}

	parseNewline()
	{
		if( this.parser.atEnd() )
			return;		// End of file counts as end of line

		let newline = this.parser.nextTerm();
		if( newline != "\n" )
			this.error( "Expected newline, got: " + newline );
	}

	error( message: string )
	{
		throw Error( "File: " + this.sourceFilename +
			", line: " + this.parser.position.line.toString() +
			", col: " + this.parser.position.column.toString() +
			": " + message );
	}

}
