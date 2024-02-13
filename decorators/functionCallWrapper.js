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
        // return statement with function call
        else if (innerNode.type == "ReturnStatement" && innerNode.argument.type == "CallExpression") {
            toChange.push({ index, innerNode: innerNode });
        }

    });
    let i = 0; // counter to keep added nodes into count
    toChange.forEach((change) => {
        // if the node is a return statement, the function call is moved to a variable and then returned
        if (change.innerNode.type == "ReturnStatement") {
            // variable with the function call
            const variableNode = {
                type:"VariableDeclaration",
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