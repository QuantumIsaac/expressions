import Parser from './parser';

function evaluateTree(operators, treeHead, values) {
    const isOperator = ch => Object.keys(operators).includes(ch);
    let v = treeHead.value;
    if( isOperator(v) ) {
        let children = treeHead.children.map(t => evaluateTree(operators, t, values));
        let opfn = operators[v].fn;
        return opfn(...children);
    } else {
        return values[v];
    }
};

class Evaluator {
    constructor(operators) {
        this._op = operators;
        this.parser = new Parser(operators);
    }
    evaluate(exp, values) {
        return this.evaluateTree(this.parser.parse(exp), values);
    }
    evaluateTree(tree, values) {
        return evaluateTree(this._op, tree, values);
    }
}

export default Evaluator;