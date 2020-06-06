import ArithmeticExpression from './arithexp';
import BooleanExpression from './boolexp';
import util from 'util';

const exp = new ArithmeticExpression('1 + --3');
console.log(util.inspect(exp.tree, false, 8));
console.log(exp.evaluate());