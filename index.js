import Parser from './parser';
import Evaluator from './evaluator';

export { Parser, Evaluator };

// TODO
// - Implement numbers directly into parser (include floating point numbers in this)
// - IMPORTANT: Allow operators to have both a unary and a binary role (this will require some modifications to the parser and evaluator)
// - make a module that generates an "Expression" class for any given operator set (thus making boolexp.js and arithexp.js simply instances of this)