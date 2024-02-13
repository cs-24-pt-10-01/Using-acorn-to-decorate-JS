import * as acornWalk from 'acorn-walk'

// wrap function calls in start and stop nodes
function wrapFunctions(ast, startNode, stopNode) {
    acornWalk.full(ast, node => {
        if (node.type == "BlockStatement" || node.type == "Program") {
            DecorateBlock(node.body, startNode, stopNode);
        }
    });
}


function containsFunctionCall(node) {
    let contains = false;
    acornWalk.full(node, innerNode => {
        if (innerNode.type == "CallExpression") {
            contains = true;
        }
    });
    return contains;
}

function DecorateBlock(body, startNode, stopNode) {
    const toChange = []; // list of nodes to wrap with start and stop nodes
    // finding function calls
    body.forEach((innerNode, index) => {
        if ((innerNode.type == "ExpressionStatement" || innerNode.type == "VariableDeclaration" || innerNode.type == "ReturnStatement") && containsFunctionCall(innerNode)) {
            toChange.push({ index, innerNode: innerNode });
        }
    });

    let i = 0; // counter to keep added nodes into count
    toChange.forEach((change) => {
        // if the node is a return statement, the function call is moved to a variable and then returned
        if (change.innerNode.type == "ReturnStatement") {
            // variable with the function call
            const variableNode = {
                type: "VariableDeclaration",
                declarations: [
                    {
                        type: "VariableDeclarator",
                        id: {
                            type: "Identifier",
                            name: "__result"
                        },
                        init: change.innerNode.argument
                    }
                ],
                kind: "const"
            }

            // Return node for returning the result
            const returnNode = {
                type: "ReturnStatement",
                argument: {
                    type: "Identifier",
                    name: "__result"
                }
            }

            // replacing the return statement with new nodes
            body.splice(change.index + i, 1, startNode, variableNode, stopNode, returnNode);
            i += 3;
        }
        else {
            // Adding nodes
            body.splice(change.index + i, 0, startNode);
            body.splice(change.index + 2 + i, 0, stopNode);
            i += 2;
        }
    });
}

export { wrapFunctions };