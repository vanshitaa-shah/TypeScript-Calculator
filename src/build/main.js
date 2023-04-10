import evaluate from "./evaluation.js";
const calc = {
    operators: ["+", "-", "*", "/", "^", "%"],
    trigoFunc: ["asin(", "acos(", "atan(", "sin(", "cos(", "tan("],
    func: ["log2(", "log(", "ln(", "abs(", "floor(", "ceil("],
};
/*------------------------------- Variable Declarations -------------------------*/
const buttonContainer = document.querySelector("#calculator-container");
const currentDisplay = document.getElementById("current-display");
const alertDisplay = document.getElementById("alert-display");
// const dropdowns: NodeListOf<Element> = document.querySelectorAll(".dropdown");
const input = document.getElementById("input");
const memoryDisplay = document.getElementById("memory-display");
// const flipBtn: HTMLElement = document.getElementById("flipBtn")!;
memoryDisplay.value = "0";
// let memory: string = "0";
// let degMode: boolean = true;
let actualExp = "";
/*------------------------------- Event Listeners-------------------------*/
//Event-delegation used for all the buttons
buttonContainer.addEventListener("click", (e) => {
    let element = e.target;
    if (element.tagName === "BUTTON") {
        switch (element.value) {
            case "clear":
                clearDisplay();
                break;
            case "backspace":
                backspace();
                break;
            case "flip":
                // flipCol();
                break;
            case "btn-flip":
                break;
            case "equalTo":
                showAnswer();
                break;
            case ".":
                // flotingPointHandler();
                break;
            case "(-":
                // signHandler();
                break;
            default:
                display(element);
                break;
        }
    }
}, true);
/*----------------- Display Function that handles the major work ------------*/
function display(obj) {
    let type = obj.getAttribute("data-type");
    let val = obj.getAttribute("value");
    let func = obj.getAttribute("data-func");
    let actualVal = obj.getAttribute("data-value");
    actualExp = String(actualExp);
    //Max Limit of the display is 25.
    if (input.value.length >= 25) {
        showAlert("Maximum Limit Reached.");
        return;
    }
    if (actualExp === "" &&
        (type === "operator" || type === "special-operator")) {
        showAlert("Enter operand first");
        return;
    }
    else if (actualExp.slice(-1) === "(" &&
        (type === "operator" || type === "special-operator")) {
        return;
    }
    else {
        if (calc.operators.includes(input.value[input.value.length - 1]) &&
            calc.operators.includes(val)) {
            if (val === "-") {
                if (actualExp.slice(-1) !== "-")
                    input.value += val;
                else
                    return;
            }
            else if (actualExp.slice(-1) === "-" &&
                calc.operators.includes(actualExp[actualExp.length - 2])) {
                return;
            }
            else {
                input.value = input.value.slice(0, -1) + val;
                actualExp = actualExp.slice(0, -1);
            }
        }
        else if (func == "memory") {
            // memoryHandler(obj);
            return;
        }
        else if (func == "F-E") {
            // fractionalToExp();
            return;
        }
        else {
            input.value += val;
        }
        switch (type) {
            case "operand":
                if (input.value.length > 1 &&
                    !input.value[input.value.length - 2].match(/[0-9]|\(|\./) &&
                    !calc.operators.includes(actualExp.slice(-1))) {
                    actualExp += "*" + val;
                    break;
                }
                actualExp += val;
                break;
            case "operator":
                actualExp += val;
                break;
            case "constant":
                if (!calc.operators.includes(actualExp.slice(0, -1)) &&
                    actualExp.slice(-1).match(/[0-9]|[)]/)) {
                    actualExp += "*" + actualVal;
                }
                else
                    actualExp += actualVal;
                break;
            case "special-operator":
                actualExp += actualVal;
                break;
            case "factorial-func":
                if (!actualExp.slice(-1).match(/[0-9]|\)/)) {
                    actualExp = "";
                    input.value = "";
                    showAlert("Enter operand first.");
                    break;
                }
                actualExp += val;
                let [replacePart, n] = getVal(actualExp);
                let ans = fact(Number(n));
                actualExp = actualExp.replace(replacePart, String(ans));
                break;
        }
        if (obj.hasAttribute("data-func") && func !== "memory") {
            if (actualExp.slice(-1) &&
                actualExp.slice(-1) !== "(" &&
                val != ")" &&
                !calc.operators.includes(actualExp.slice(-1))) {
                actualExp += "*";
                input.value = actualExp + val;
            }
            if (obj.getAttribute("data-func") == ")" && !actualExp.includes("(")) {
                showAlert("No open Parenthesis found.");
                input.value = "";
                return;
            }
            actualExp += obj.getAttribute("data-func");
        }
        if (val === "(" &&
            actualExp.length > 1 &&
            !calc.operators.includes(actualExp[actualExp.length - 2]) &&
            actualExp[actualExp.length - 2] !== "(") {
            actualExp = actualExp.slice(0, -1) + "*" + val;
            input.value = input.value.slice(0, -1) + "*" + val;
        }
        currentDisplay.value = actualExp + " = ";
    }
}
/*-------------------- ShowAnswer fn shows the answer on display ------------------*/
function showAnswer() {
    if (isBalancedParanthesis(actualExp) !== 0) {
        showAlert("Invalid Paranthesis");
        return;
    }
    actualExp = String(actualExp);
    let res = String(evaluate(actualExp));
    if (isNaN(Number(res))) {
        showAlert("Syntax error");
        input.value = "";
        actualExp = "";
        currentDisplay.value = "";
        return;
    }
    if (currentDisplay.value.includes("e+")) {
        res = Number(res).toExponential(4);
    }
    else if (Math.trunc(Number(res)).toString().length >= 15) {
        res = Number(res).toExponential(4);
    }
    input.value = res;
    actualExp = res.toString();
    currentDisplay.value = "";
}
/*-------------------- ClearDisplay and backSpace Functions ------------------*/
function clearDisplay() {
    input.value = "";
    actualExp = "";
    currentDisplay.value = actualExp;
}
function backspace() {
    input.value = input.value.slice(0, -1);
    actualExp = actualExp.slice(0, -1);
    currentDisplay.value = actualExp + " = ";
    if (currentDisplay.value === " = ") {
        clearDisplay();
    }
}
/*----------------------- ShowAlert()-Alerts are Handled Here ---------------------*/
function showAlert(msg) {
    let element = alertDisplay.parentElement;
    element.classList.remove("invisible");
    alertDisplay.value = " ! " + msg;
    currentDisplay.value = "";
    actualExp = "";
    input.value = "";
    setTimeout(() => {
        element.classList.add("invisible");
    }, 1500);
}
/*----------------------------- Some Utiliy functions ----------------------------*/
// Gives the factorial of a number.
function fact(n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    else if (n < 0) {
        showAlert("Invalid Input.");
        return undefined;
    }
    else {
        return n * fact(n - 1);
    }
}
// Checks for the valid paranthesis
function isBalancedParanthesis(exp) {
    let balanceFactor = 0;
    for (let i = 0; i < exp.length; i++) {
        if (exp[i] == "(") {
            balanceFactor++;
        }
        if (exp[i] == ")") {
            balanceFactor--;
        }
    }
    return balanceFactor;
}
// Utility function used for getting the values in different scenarios
function getVal(exp) {
    if (exp[exp.length - 1] === "!") {
        if (exp[exp.length - 2] === ")") {
            return [
                exp.slice(exp.lastIndexOf("(")),
                String(evaluate(String(getVal(exp.slice(0, -1))))),
            ];
        }
        let i = exp.length - 1;
        while (!calc.operators.includes(exp[i])) {
            i--;
            if (i === 0) {
                i--;
                break;
            }
        }
        return [exp.slice(i + 1, exp.length), exp.slice(i + 1, exp.length - 1)];
    }
    else if (exp[exp.length - 1] === ")") {
        let i = exp.length - 1;
        while (exp[i] !== "(") {
            i--;
        }
        return exp.slice(i + 1, exp.length - 1);
    }
    else {
        if (actualExp == "") {
            showAlert("Enter Number First");
            return;
        }
        exp = String(exp);
        let i = exp.length - 1;
        while (!calc.operators.includes(exp[i])) {
            i--;
            console.log(i);
            if (exp[i] == "(") {
                return exp.slice(i + 1, exp.length);
            }
            if (i === -1) {
                break;
            }
        }
        if (exp[i] == "-") {
            i--;
        }
        return exp.slice(i + 1, exp.length);
    }
}
