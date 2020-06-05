import ArithmeticExpression from './arithexp';

const expression = "( 2 + 3 - 1 ) / ( 5 - 2 )";

console.log("Expression to parse: " + expression);

var exp = new ArithmeticExpression(expression);

// TEMPORARY: Only until numbers are implemented in the parser directly.
let numbers = {};
for( let number of exp.getTokens() ) {
    numbers[number] = parseInt(number);
}

console.log("Evaluated: " + exp.evaluate(numbers));