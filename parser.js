import { recurseTree } from './tree';

const stackify = arr => {
	arr = arr || [];
	arr.peek = () => arr[arr.length-1];
	return arr;
};

let assert = (bool, msg) => {
	if( !bool ) throw new Error(msg);
};

const format = (tk) => typeof tk === 'string' ? { value: tk, children: [] } : tk;

const makeTreeNode = (op, a, b) => {
	return {
		value: op,
		children: [a, b]
	}
};

// Break an expression into discrete tokens
// for simpler preprocessing and parsing
const tokenize = (operators, exp) => {
    const isOperator = chr => Object.keys(operators).includes(chr);

	let tokens = [];

	let cur_token = '';
	const push_token = () => {
		if( cur_token !== '' ) {
			if( /^[0-9]+(\.[0-9]+)?$/.test(cur_token) ) {
				tokens.push({
					value: cur_token,
					type: 'number'
				});
			} else {
				assert(!cur_token.includes('.'), "Identifiers may not contain periods!");
				assert(!/[0-9]/.test(cur_token[0]), "Identifiers may not begin with digits!");
				tokens.push({
					value: cur_token,
					type: 'identifier'
				});
			}
			cur_token = '';
		}
	};

	for( let char of exp ) {
		if( /[a-zA-Z0-9_]/.test(char) ) {
			cur_token += char;
		} else if( char === '.' && /^[0-9]+$/.test(cur_token) ) {
			cur_token += char;
		} else if( /\s/.test(char) ) {
			push_token();
		} else {
			push_token();
			if( isOperator(char) ) {
				tokens.push({
					value: char,
					type: 'operator'
				});
			} else tokens.push({
				value: char,
				type: 'unknown'
			});
		}
	}

	push_token();

	return tokens;
};

const isOperand = tk => {
	return tk.type === 'identifier' || tk.type === 'number';
}

const parseExpression = (operators, exp) => {
    const OPERATOR = operators;
    const isBinaryOperator = chr => Object.keys(OPERATOR).filter(op => OPERATOR[op].binary).includes(chr);
    const isUnaryOperator = chr => Object.keys(OPERATOR).filter(op => OPERATOR[op].unary).includes(chr);

	const operator_stack = stackify();
	const operand_stack = stackify();

	let unique_tokens = [];

	let unaryOp = 0;
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
	
	let tokens = tokenize(OPERATOR, exp);

	let getToken = idx => (idx >= 0 && idx < tokens.length) ? tokens[idx] : null;

	// check if expression is valid
	let parenValid = 0;
	for( let t = 0; t < tokens.length; t++ ) {
		let token = tokens[t];
		if( token.type === 'operator' ) {
			if( isBinaryOperator(token.value) ) {
				let valid = false;
				let tk = t+1;
				while( getToken(tk) !== null && !valid ) {
					if( isBinaryOperator(getToken(tk)) ) break;
					else if( isOperand(getToken(tk)) || getToken(tk).value === '(' ) valid = true;
					tk++;
				}
				assert(valid, "Binary operator must have a right-hand operand.");

				if( isUnaryOperator(token.value) ) {
					// operator only has a right-hand operand, and can function as a unary operator.
					// as such, it will be treated as a unary operator when a LH operand is not found.
					token.unary = true;
				} else {
					let prevToken = getToken(t-1);
					assert(prevToken !== null, "Binary operator must have a left-hand operand.");
					assert(isOperand(prevToken) || prevToken.value === ')', "Binary operator may not be directly preceded by an operator."); // either identifier or expression
				}
			} else {
				let t2 = t+1;
				let operates = false;
				while( !operates && getToken(t2) !== null ) {
					let cur = getToken(t2++);
					operates = isOperand(cur) || cur.value === '(';
				}
				assert("Unary operator must operate on an identifier or expression.");
			}
		} else if( isOperand(token) ) {
			let prevCheckToken = t-1;
			let valid = true;
			while( valid && getToken(prevCheckToken) !== null ) {
				let tk = getToken(prevCheckToken--);
				if( isBinaryOperator(tk.value) ) break;
				else if( isOperand(tk) || tk.value === ')' ) valid = false;
			}
			assert(valid, "Operands may not be placed adjacent to one another without an operator in between.");
		} else {
			if( token.value === '(' ) {
				parenValid++;
			} else if( token.value === ')' ) {
				assert(parenValid !== 0, "Mismatched closing parenthesis.");
				parenValid--;
			}
		}
	}
	
	assert(parenValid === 0, "Unclosed parenthesis in expression!");

	let grabbingExpression = false;
	let expression = '';
	let expParen = 0;
	for( let token of tokens ) {
		// first check if grabbing expression
		if( grabbingExpression ) {
			if( token.value === '(' ) {
				expParen++;
				expression += '(';
			} else if( token.value === ')' ) {
				expParen--;
				if( expParen === 0 ) {
					let exp = parseExpression(operators, expression);
                    let exp_tk = exp.tokens;
                    for( let tk of exp_tk ) {
                        if( !unique_tokens.includes(tk) ) unique_tokens.push(tk);
                    }
                    delete exp.tokens; // remove extraneous data from internal tree nodes
                    operand_stack.push(exp);
                    aggregateUnaryOp();
					expression = '';
					grabbingExpression = false;
				} else {
					expression += ')';
				}
			} else expression += token.value;
			continue;
		}
		
		if( isOperand(token) ) {
			operand_stack.push(token.value);
			aggregateUnaryOp();
			if( token.type === 'identifier' && !unique_tokens.includes(token.value) ) unique_tokens.push(token.value);
		} else if( isBinaryOperator(token.value) && !token.unary ) {
			if( operator_stack.length > 0 && OPERATOR[token.value].precedence < OPERATOR[operator_stack.peek()].precedence ) {
				const operands = [operand_stack.pop()];
				const operators = [];
				let prec = OPERATOR[operator_stack.peek()].precedence;
				while( OPERATOR[operator_stack.peek()].precedence === prec ) {
					operands.push(operand_stack.pop());
					operators.push(operator_stack.pop());
				}
				while(operators.length > 0) {
                    let op2 = operands.pop();
                    let op1 = operands.pop();
					let new_operand = makeTreeNode(operators.pop(), op1, op2);
					operands.push(new_operand);
				}
				operand_stack.push(operands[0]);
			}
			operator_stack.push(token.value);
		} else if( isUnaryOperator(token.value) ) {
			unaryOp++;
			operator_stack.push(token.value);
		} else if( token.value === '(' ) {
			grabbingExpression = true;
			expParen++;
		} else {
			throw new Error(`Unexpected character '${token.value}'`);
		}
	}

	if( grabbingExpression ) {
		throw new Error('Expression contains unmatched opening parenthesis.');
	}

	while(operator_stack.length > 0) {
		let op2 = format(operand_stack.pop());
		let op1 = format(operand_stack.pop());
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

class Parser {
    constructor(operators) {
        this._op = operators;
    }
    parse(exp) {
		let tree = parseExpression(this._op, exp);
		// recurse tree and replace all number strings with actual numbers
		recurseTree(tree, node => {
			if( /^[0-9]+(\.[0-9]+)?$/.test(node.value) ) {
				node.value = parseFloat(node.value);
			}
		});
		return tree;
    }
}

export default Parser;