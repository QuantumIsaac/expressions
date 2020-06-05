// Boolean Expressions Parser/Evaluator

const OPERATOR = {
	// operator precedence
	'*': {
        precedence: 2,
        binary: true,
		fn: (a, b) => a && b
	},
	'+': {
        precedence: 1,
        binary: true,
		fn: (a, b) => a || b
    },
    '~': {
        binary: false,
        fn: a => !a
    }
};

const isOperator = chr => Object.keys(OPERATOR).includes(chr);
const isBinaryOperator = chr => Object.keys(OPERATOR).filter(op => OPERATOR[op].binary).includes(chr);
const isUnaryOperator = chr => Object.keys(OPERATOR).filter(op => !OPERATOR[op].binary).includes(chr);
const stackify = arr => {
	arr = arr || [];
	arr.peek = () => arr[arr.length-1];
	return arr;
};

const format = (tk) => typeof tk === 'string' ? { value: tk, children: [] } : tk;

const makeTreeNode = (op, a, b) => {
	return {
		value: op,
		children: [a, b]
	}
};

// TODO: Tokenizing.
// Tokenize expression first in order to be able to
// look ahead/behind to verify valid formatting
// (e.g. to ensure that a binary operator is preceded by
// and followed by literals or expressions rather than
// another binary operator)

const parseExpression = exp => {
	const operator_stack = stackify();
	const operand_stack = stackify();

	let unique_tokens = [];

    let token = '';
	let unaryOp = 0;
	const pushToken = () => {
        operand_stack.push(token);
        aggregateUnaryOp();
		if( !unique_tokens.includes(token) ) unique_tokens.push(token);
		token = '';
    };
    
    const aggregateUnaryOp = () => {
        while( unaryOp > 0 ) {
            let op = operator_stack.pop();
            let operand = operand_stack.pop();
            operand_stack.push({
                value: op,
                children: [format(operand)]
            });
            unaryOp--;
        }
    };

	let grabbingExpression = false;
	let expression = '';
	let expParen = 0;
	for( let char of exp ) {
		// first check if grabbing expression
		if( grabbingExpression ) {
			if( char === '(' ) {
				expParen++;
				expression += '(';
			} else if( char === ')' ) {
				expParen--;
				if( expParen === 0 ) {
					let exp = parseExpression(expression);
                    let exp_tk = exp.tokens;
                    for( let token of exp_tk ) {
                        if( !unique_tokens.includes(token) ) unique_tokens.push(token);
                    }
                    delete exp.tokens; // remove extraneous data from internal tree nodes
                    operand_stack.push(exp);
                    aggregateUnaryOp();
					expression = '';
					grabbingExpression = false;
				} else {
					expression += ')';
				}
			} else expression += char;
			continue;
		}

		if( /\s/.test(char) ) {
			if( token !== '' ) pushToken();
		} else if( /[a-zA-Z0-9_]/.test(char) ) {
			token += char;
		} else {
			if( token !== '' ) pushToken();
			if( isBinaryOperator(char) ) {
				if( operator_stack.length > 0 && OPERATOR[char].precedence < OPERATOR[operator_stack.peek()].precedence ) {
					const op1 = operand_stack.pop();
					const op2 = operand_stack.pop();
					const op = operator_stack.pop();
					operand_stack.push(makeTreeNode(op, op1, op2));
				}
				operator_stack.push(char);
			} else if( isUnaryOperator(char) ) {
                unaryOp++;
                operator_stack.push(char);
            }else if( char === '(' ) {
				grabbingExpression = true;
				expParen++;
			} else {
				throw new Error(`Unexpected character '${char}'`);
			}
		}
	}

	if( grabbingExpression ) {
		throw new Error('Expression contains unmatched opening parenthesis.');
	}

	if( token !== '' ) pushToken();

	while(operator_stack.length > 0) {
		let op1 = format(operand_stack.pop());
		let op2 = format(operand_stack.pop());
        let op = operator_stack.pop();

		operand_stack.push(makeTreeNode(op, op1, op2));
	}
	if( operand_stack.length > 1 ) {
		throw new Error('Too many operands!');
    }

    let retObj = format(operand_stack[0]);
	retObj.tokens = unique_tokens;

	return operand_stack[0]; // should be the expression tree (or a single-token string)
};

class Expression {
    constructor(exp) {
        if( typeof exp !== 'string' ) {
            throw new Error("Expression constructor takes in a boolean expression.");
        }
        this.tree = parseExpression(exp);
    }
    getTokens() {
        return this.tree.tokens;
    }
    evaluate(values) {
        for( let token of this.tree.tokens ) {
            if( !values.hasOwnProperty(token) ) throw new Error("values must define a boolean value for every variable.");
        }
        return evaluateTree(this.tree, values);
    }
}

function evaluateTree(treeHead, values) {
    let v = treeHead.value;
    if( isOperator(v) ) {
        let children = treeHead.children.map(t => evaluateTree(t, values));
        let opfn = OPERATOR[v].fn;
        return opfn(...children);
    } else {
        return values[v];
    }
};

export default Expression;