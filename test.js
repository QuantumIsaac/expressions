import BooleanExpression from './boolexp';
import ArithmeticExpression from './arithexp';
import util from 'util';

const exp = new ArithmeticExpression("(x*y^2)/x^2");
console.log(util.inspect(exp, false, 8));
console.log(exp.evaluate({
    x: 2,
    y: 2
}));