import * as acornWalk from 'acorn-walk'

// wrap function calls in start and stop nodes
function wrapFunctions(ast, startNode, stopNode) {
    acornWalk.full(ast, node => {
        if (node.type == "BlockStatement" || node.type == "Program") {
            DecorateBlock(node.body, startNode, stopNode);
        }
    });
}

function DecorateBlock(body, startNode, stopNode) {
    const toChange = []; // list of nodes to wrap with start and stop nodes
    body.forEach((innerNode, index) => {
        // Function call
        if (innerNode.type == "ExpressionStatement" && innerNode.expression.type == "CallExpression") {
            toChange.push({ index, innerNode: innerNode });
        }
        else if (innerNode.type == "ExpressionStatement" && innerNode.expression.type == "AssignmentExpression" && innerNode.expression.right.type == "CallExpression") {
            toChange.push({ index, innerNode: innerNode });
        }
        // Variable declaration with function call
        else if (innerNode.type == "VariableDeclaration") {
            for (let i = 0; i < innerNode.declarations.length; i++) {
                if (innerNode.declarations[i].init && innerNode.declarations[i].init.type == "CallExpression") {
                    toChange.push({ index, innerNode: innerNode });
                }
            }
        }
    });
    let i = 0; // counter to keep added nodes into count
    toChange.forEach((change) => {
        // Adding nodes
        body.splice(change.index + i, 0, startNode);
        body.splice(change.index + 2 + i, 0, stopNode);
        i += 2;
    });
}

export { wrapFunctions };