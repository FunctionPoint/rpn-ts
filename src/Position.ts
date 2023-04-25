// Keeps a position in a string being parsed
// with string index, line number and column number.

export class Position
{
	index: number = 0;
	line: number = 1;
	column: number = 0;

	// Increment index, line and column, depending on char parsed.
	// Returns incremented index.

	increment( char: string ): number
	{
		this.index++;
		if( char == "\n" ) {
			this.line++;
			this.column = 0;
		}
		else
			this.column++;

		return this.index;
	}

	// Assign argument position to this.

	assign( position: Position ): Position
	{
		this.index = position.index;
		this.line = position.line;
		this.column = position.column;

		return this;
	}

}

