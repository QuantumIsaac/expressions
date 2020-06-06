// Boolean Expressions Parser/Evaluator

import Evaluator from './evaluator';

const OPERATOR = {
	// operator precedence
	'*': {
        precedence: 2,
        binary: true,
        unary: false,
		fn: (a, b) => a && b
	},
	'+': {
        precedence: 1,
        binary: true,
        unary: false,
		fn: (a, b) => a || b
    },
    '~': {
        binary: false,
        unary: true,
        ufn: a => !a
    }
};

const BOOLEAN_EVALUATOR = new Evaluator(OPERATOR);

class Expression {
    constructor(exp) {
        if( typeof exp !== 'string' ) {
            throw new Error("Expression constructor takes in a boolean expression.");
        }
        this.tree = BOOLEAN_EVALUATOR.parser.parse(exp);
    }
    getTokens() {
        return this.tree.tokens;
    }
    evaluate(values) {
        for( let token of this.tree.tokens ) {
            if( !values.hasOwnProperty(token) ) throw new Error("values must define a boolean value for every variable.");
        }
        return BOOLEAN_EVALUATOR.evaluate(this.tree, values);
    }
}

export default Expression;