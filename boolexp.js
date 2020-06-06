// Boolean Expressions Parser/Evaluator

import Evaluator from './evaluator';
import { recurseTree } from './tree';

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

        // need to recurse through tree to check for invalid numbers
        // (0 and 1 are the only acceptable numbers), also need to 
        // change 0 and 1 to their boolean counterparts.
        recurseTree(this.tree, node => {
            if( typeof node.value === 'number' ) {
                if( ![0, 1].includes(node.value) ) throw new Error(`Invalid literal ${node.value} in boolean expression.`);
                else {
                    node.value = (node.value === 1) ? true : false;
                }
            }
        });

        this._exp = exp;
    }

    get expression() {
        return this._exp;
    }

    getTokens() {
        return this.tree.tokens;
    }
    evaluate(values = {}) {
        for( let token of this.tree.tokens ) {
            if( !values.hasOwnProperty(token) ) throw new Error("values must define a boolean value for every variable.");
        }

        return BOOLEAN_EVALUATOR.evaluateTree(this.tree, values);
    }
}

export default Expression;