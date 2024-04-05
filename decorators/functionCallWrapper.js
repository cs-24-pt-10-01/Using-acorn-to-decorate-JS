import * as acornWalk from 'acorn-walk'
import { toJs } from 'estree-util-to-js'

// wrap function calls in start and stop nodes
function wrapFunctions(ast, startNode, stopNode, importNode, onlyBody = false) {
    // decorate main body
    DecorateBlock(ast.body, startNode, stopNode, importNode);

    // decorating other blocks in the program
    if (!onlyBody) {
        acornWalk.full(ast, node => {
            if (node.type == "BlockStatement") {
                DecorateBlock(node.body, startNode, stopNode, importNode);
            }
        });
    }
    // inserting import into program body
    ast.body.splice(0, 0, importNode);
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

function findFunctionCallsInBody(body) {
    const calls = [];
    body.forEach((innerNode, index) => {
        if ((innerNode.type == "ExpressionStatement" || innerNode.type == "VariableDeclaration" || innerNode.type == "ReturnStatement") && containsFunctionCall(innerNode)) {
            calls.push({ index, innerNode: innerNode });
        }
    });
    return calls;
}

function findFunctionCallsInAST(ast) {
    const functionCalls = [];
    acornWalk.full(ast, node => {
        if (node.type == "BlockStatement" || node.type == "Program") {
            functionCalls.push(...findFunctionCallsInBody(node.body));
        }
    });
    // formatting the result
    const result = functionCalls.map((call) => {
        return {
            position: call.innerNode.loc.start,
            call: toJs(call.innerNode).value,
            node: call.innerNode
        }
    });
    return result;
}

function getFunctionName(node) {
    let functionName = null;
    if (node.type == "CallExpression") {
        if (node.callee.type == "MemberExpression") {
            return node.callee.property.name;
        }
        return node.callee.name;
    }
    acornWalk.full(node, innerNode => {
        if (innerNode.type == "CallExpression") {
            if (innerNode.callee.type == "MemberExpression") {
                functionName = innerNode.callee.property.name;
            }
            else
                functionName = innerNode.callee.name;
        }
    });

    return functionName;
}

function DecorateBlock(body, startNode, stopNode, importNode) {
    const toChange = findFunctionCallsInBody(body);

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
            body.splice(change.index + i, 1, startNode(change.innerNode), variableNode, stopNode(change.innerNode), returnNode);
            i += 3;
        }
        else {
            // Adding nodes
            body.splice(change.index + i, 0, startNode(change.innerNode));
            body.splice(change.index + 2 + i, 0, stopNode(change.innerNode));
            i += 2;
        }
    });
}

export { wrapFunctions, findFunctionCallsInAST, getFunctionName };