const recurseTree = (tree, fn) => {
	fn(tree);
	if( tree.children.length > 0 ) {
		for( let child of tree.children ) {
			recurseTree(child, fn);
		}
	}
};

export { recurseTree }