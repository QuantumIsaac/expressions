// Arithmetic Expressions Parser/Evaluator

import Evaluator from './evaluator';

const OPERATOR = {
    // operator precedence
    '^': {
        precedence: 3,
        binary: true,
        fn: (a, b) => Math.pow(a, b)
    },
	'*': {
        precedence: 2,
        binary: true,
		fn: (a, b) => a * b
	},
	'+': {
        precedence: 1,
        binary: true,
		fn: (a, b) => a + b
    },
    '/': {
        precedence: 2,
        binary: true,
        fn: (a, b) => a / b
    },
    '-': {
        precedence: 1,
        binary: true,
        unary: true,
        fn: (a, b) => a - b,
        ufn: (a) => -a
    }
};

const ARITHMETIC_EVALUATOR = new Evaluator(OPERATOR);

class Expression {
    constructor(exp) {
        if( typeof exp !== 'string' ) {
            throw new Error("Expression constructor takes in an arithmetic expression.");
        }
        this.tree = ARITHMETIC_EVALUATOR.parser.parse(exp);
        for( let token of this.tree.tokens ) {
            if( token.length > 1 ) {
                throw new Error("Variables may not be longer than one character long!");
            }
        }
    }
    getTokens() {
        return this.tree.tokens;
    }
    evaluate(values = {}) {
        for( let token of this.tree.tokens ) {
            if( !values.hasOwnProperty(token) ) throw new Error("values must define a numeric value for every variable.");
        }
        return ARITHMETIC_EVALUATOR.evaluateTree(this.tree, values);
    }
}

export default Expression;