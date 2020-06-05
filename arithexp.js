// Arithmetic Expressions Parser/Evaluator

import Evaluator from './evaluator';

const OPERATOR = {
	// operator precedence
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
        fn: (a, b) => a - b
    }
};

const ARITHMETIC_EVALUATOR = new Evaluator(OPERATOR);

class Expression {
    constructor(exp) {
        if( typeof exp !== 'string' ) {
            throw new Error("Expression constructor takes in an arithmetic expression.");
        }
        this.tree = ARITHMETIC_EVALUATOR.parser.parse(exp);
    }
    getTokens() {
        return this.tree.tokens;
    }
    evaluate(values) {
        for( let token of this.tree.tokens ) {
            if( !values.hasOwnProperty(token) ) throw new Error("values must define a numeric value for every variable.");
        }
        return ARITHMETIC_EVALUATOR.evaluateTree(this.tree, values);
    }
}

export default Expression;