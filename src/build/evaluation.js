// Evaluates the expression.
export default function evaluatePrefix(expression) {
    let prefixExp = infixToPrefix(expression).trimStart();
    let tokens = prefixExp.split(" ");
    let stack = [];
    for (let i = tokens.length - 1; i >= 0; i--) {
        let token = tokens[i];
        if (token.match(/[0-99999]/i)) {
            stack.push(parseFloat(token));
        }
        else if (token && token !== ")" && token !== "(") {
            let operand1 = stack.pop();
            let operand2 = stack.pop();
            let result = 0;
            switch (token) {
                case "+":
                    result = operand1 + operand2;
                    break;
                case "-":
                    result = operand1 - operand2;
                    break;
                case "*":
                    result = operand1 * operand2;
                    break;
                case "/":
                    result = operand1 / operand2;
                    break;
                case "%":
                    result = operand1 % operand2;
                    break;
                case "^":
                    result = Math.pow(operand1, operand2);
                    break;
            }
            stack.push(result);
        }
    }
    return stack.pop();
}
// Precedence of Operators
function precedence(operator) {
    if (operator === "+" || operator === "-") {
        return 1;
    }
    else if (operator === "*" || operator === "%" || operator === "/") {
        return 2;
    }
    else if (operator === "^") {
        return 3;
    }
    else {
        return 0;
    }
}
// Converts Expression into Prefix Notation
function infixToPrefix(expression) {
    let parts = splitByOperator(expression).reverse();
    let stack = [];
    let result = "";
    for (let i = 0; i < parts.length; i++) {
        let c = parts[i];
        if (c.match(/[0-99999]/i)) {
            result += c + " ";
        }
        else if (c === ")") {
            stack.push(c);
        }
        else if (c) {
            while (stack.length > 0 &&
                stack[stack.length - 1] !== ")" &&
                precedence(c) < precedence(stack[stack.length - 1])) {
                result += stack.pop() + " ";
            }
            if (c === ")") {
                stack.pop();
            }
            else {
                stack.push(c);
            }
        }
    }
    while (stack.length > 0) {
        result += stack.pop() + " ";
    }
    return result.split(" ").reverse().join(" ");
}
// Utility function used for sepration by operator.
function splitByOperator(expression) {
    const operators = ["+", "-", "*", "/", "(", ")", "^", "%"];
    let currentNumber = "";
    const parts = [];
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (operators.includes(char)) {
            if (currentNumber !== "") {
                parts.push(currentNumber);
                currentNumber = "";
            }
            parts.push(char);
        }
        else {
            currentNumber += char;
            if (i === expression.length - 1) {
                parts.push(currentNumber);
            }
        }
    }
    for (let item in parts) {
        if (parts[item] == "-") {
            if ((Number(item) == 0 && parts[Number(item) + 1] != "(") ||
                parts[Number(item) - 1] == "(" ||
                (isNaN(Number(parts[Number(item) - 1])) &&
                    parts[Number(item) - 1] != ")")) {
                let x = parts[item];
                let y = parts[Number(item) + 1];
                let temp = x + y;
                parts.splice(Number(item), 2, temp);
            }
        }
    }
    return parts;
}
