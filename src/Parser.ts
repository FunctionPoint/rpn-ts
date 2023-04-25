import { Position } from "./Position";

export class Parser
{
	source: string;
	position: Position = new Position;
	startPosition: Position = new Position;

	constructor( source: string )
	{
		this.source = source;
	}

	matchTerm( matchTerm: string ): boolean
	{
		return this.nextTerm() == matchTerm;
	}

	peekTerm(): string
	{
		let savedPosition = new Position().assign( this.position );
		let term = this.nextTerm();
		this.position = savedPosition;

		return term;
	}

	nextTerm(): string
	{
		this.skipSpace();
		if( this.atEnd() )
			throw Error( "Unexpected end of source" );

		let term: string;
		if( this.atNewline() )
			term = this.nextChar();
		else {
			term = '';
			while( !this.atEnd() && !this.atSpace() && !this.atNewline() )
				term += this.nextChar();
		}

		this.skipSpace();

		return term;
	}

	skipSpace()
	{
		while( !this.atEnd() && this.atSpace() )
			this.nextChar();
	}

	nextChar(): string
	{
		let char = this.source[ this.position.index ];
		this.position.increment( char );
		return char;
	}

	atSpace(): boolean
	{
		let code = this.peekChar().charCodeAt( 0 );
		return code == 32 || code == 9 || code == 13;
	}

	atNewline(): boolean
	{
		return this.peekChar() == "\n";
	}

	peekChar(): string
	{
		return this.atEnd() ? '' : this.source[ this.position.index ];
	}

	atEnd(): boolean
	{
		return this.position.index >= this.source.length;
	}

	updateStartPosition()
	{
		this.startPosition.assign( this.position );
	}

}
