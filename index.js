import BooleanExpression from './boolexp';
import AlgebraicExpression from './arithexp';

export { BooleanExpression, AlgebraicExpression };

// TODO
// - make a module that generates an "Expression" class for any given operator set (thus making boolexp.js and arithexp.js simply instances of this)