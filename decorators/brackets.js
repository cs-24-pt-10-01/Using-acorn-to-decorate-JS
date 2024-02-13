import * as acornWalk from 'acorn-walk'

// wraps content of bracket with start and stop nodes
function decorateBrackets(ast, startNode, stopNode) {
    // add start and stop nodes to the beginning and end of each bracket
    acornWalk.full(ast, node => {
        if (node.type == "BlockStatement") {
            node.body.unshift(startNode);
            node.body.push(stopNode);
        }
    });
}

export { decorateBrackets };