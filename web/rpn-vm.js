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

	top()
	{
		if ( this.stack.length <= 0 )
			throw new Error( "Can't get top from empty stack" );

		return this.stack[ this.stack.length - 1 ];
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

	// Print outputs value on top of stack in de div and leaves it there.

	print()
	{
		let value = this.top();
		if( Math.floor( value ) != value )
			throw new Error( 'Value argument must be an integer' );

		var element = document.createElement( 'div' );
		var text = document.createTextNode( value.toString() );
		element.appendChild( text );
		document.body.appendChild( element );
	}
}

