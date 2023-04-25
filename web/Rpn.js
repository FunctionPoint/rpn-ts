export class Rpn
{
	stack = [];

	push( value )
	{
		this.stack.push( value );
	}

	pop()
	{
		if ( this.stack.length <= 0 )
			throw new Error( "Can't pop from empty stack" );

		return this.stack.pop();
	};

	add()
	{
		this.push( this.pop() + this.pop() );
	}

	subtract()
	{
		let right = this.pop();
		this.push( this.pop() - right );
	}

	multiply()
	{
		this.push( this.pop() * this.pop() );
	}

	divide()
	{
		let right = this.pop();
		if( right == 0 )
			throw new Error( 'Division by 0' );
		this.push( this.pop() / right );
	}

	// Example: "7 2 print" means print number 7 two times.

	print()
	{
		let repeat = this.pop();
		if( repeat <= 0 )
			throw new Error( 'Repeat argument must be greater than 0' );

		let value = this.pop();
		if( Math.floor( value ) != value )
			throw new Error( 'Value argument must be an integer' );

		while ( repeat-- > 0 ) {
			var element = document.createElement( 'div' );
			var text = document.createTextNode( value.toString() );
			element.appendChild( text );
			document.body.appendChild( element );
		}
	}
}

