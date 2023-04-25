import { Parser } from "./Parser";

import { SourceNode } from "source-map";
import * as fs from "fs";

export class Compiler
{
	parser: Parser = new Parser( '' );
	sourceFilename = '';

	static rpnExtension = ".rpn";
	static operatorMap = new Map( [
		[ "+", "add" ],
		[ "-", "subtract" ],
		[ "*", "multiply" ],
		[ "/", "divide" ],
		[ "print", "print" ]
	] );

	compileFiles( sourceFilenames: string[] )
	{
		for( let sourceFilename of sourceFilenames )
			this.compileFile( sourceFilename );
	}

	compileFile( sourceFilename: string )
	{
		let codeFilename =
			sourceFilename.toLowerCase().endsWith( Compiler.rpnExtension ) ?
			sourceFilename.slice( 0, - Compiler.rpnExtension.length ) + ".js" :
			sourceFilename;
		this.sourceFilename = sourceFilename;
		let mapFilename = codeFilename + ".map";

		let input = fs.readFileSync( sourceFilename ).toString();

		let rootNode = this.compileSource( input );

		// codeWithSourceMap interface: { code: String, map: SourceMapGenerator }
		let codeWithSourceMap = rootNode.toStringWithSourceMap( { file: mapFilename } );

		// We must add the //# sourceMappingURL comment directive
		// so that the browser’s debugger knows where to find the source map.
		codeWithSourceMap.code += "\n//# sourceMappingURL=" + mapFilename + "\n";

		fs.writeFileSync( codeFilename, codeWithSourceMap.code );
		fs.writeFileSync( mapFilename, codeWithSourceMap.map.toString() );
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
			.add( "import { Rpn } from './Rpn.js';\n" )
			.add( "let rpn = new Rpn();\n" );
	}

	// An expression can be a value or a (nested) operator with 2 arguments.
	// E.g.: RPN source: "c a b 1 - / =" evaluates as JS source: "c = a / ( b - 1 )"
	// So, if a == 8 and b == 3 then resulting c == 4.

	compileExpression(): SourceNode
	{
		let left = this.compileValue();
		if( !this.isValue( this.parser.peekTerm() ) )
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
		return ( this.isNumber( value ) || this.isVariable( value ) ) && value != 'print' ;
	}

	isVariable( value: string ): boolean
	{
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
