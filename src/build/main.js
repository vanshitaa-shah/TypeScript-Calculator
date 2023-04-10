import evaluate from "./evaluation.js";
const calc = {
    operators: ["+", "-", "*", "/", "^", "%"],
    trigoFunc: ["asin(", "acos(", "atan(", "sin(", "cos(", "tan("],
    func: ["log2(", "log(", "ln(", "abs(", "floor(", "ceil("],
};
/*------------------------------- Variable Declarations -------------------------*/
const buttonContainer = document.querySelector("#calculator-container");
const currentDisplay = document.querySelector("#current-display");
const alertDisplay = document.querySelector("#alert-display");
const dropdowns = document.querySelectorAll(".dropdown");
const input = document.querySelector("#input");
const memoryDisplay = document.querySelector("#memory-display");
const flipBtn = document.querySelector("#flipBtn");
memoryDisplay.value = "0";
let memory = "0";
let degMode = true;
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
                flipCol();
                break;
            case "btn-flip":
                break;
            case "equalTo":
                showAnswer();
                break;
            case ".":
                flotingPointHandler();
                break;
            case "(-":
                signHandler();
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
            memoryHandler(obj);
            return;
        }
        else if (func == "F-E") {
            fractionalToExp();
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
        if (val === ")" &&
            calc.trigoFunc.some((substring) => actualExp.includes(substring))) {
            let funcArr = calc.trigoFunc.filter((i) => {
                return actualExp.includes(i);
            });
            let x = Number(getVal(actualExp));
            let start = actualExp.indexOf(funcArr[0]);
            let addVal;
            switch (funcArr[0]) {
                case "asin(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? (Math.asin(x) * 180) / Math.PI : Math.asin(x);
                    addVal = addVal.toFixed(5);
                    break;
                case "acos(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? (Math.acos(x) * 180) / Math.PI : Math.acos(x);
                    addVal = addVal.toFixed(5);
                    break;
                case "atan(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? (Math.atan(x) * 180) / Math.PI : Math.atan(x);
                    addVal = addVal.toFixed(5);
                    break;
                case "sin(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? Math.sin((x * Math.PI) / 180) : Math.sin(x);
                    addVal = addVal.toFixed(5);
                    break;
                case "cos(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? Math.cos((x * Math.PI) / 180) : Math.cos(x);
                    addVal = addVal.toFixed(5);
                    break;
                case "tan(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = degMode ? Math.tan((x * Math.PI) / 180) : Math.tan(x);
                    if (Math.trunc(addVal).toString().length >= 6) {
                        input.value = "infinity";
                        currentDisplay.value = "";
                        actualExp = "";
                        return;
                    }
                    addVal = addVal.toFixed(5);
                    break;
            }
            actualExp = actualExp.slice(0, start);
            actualExp += addVal;
        }
        else if (val === ")" &&
            calc.func.some((substring) => actualExp.includes(substring))) {
            let funcArr = calc.func.filter((i) => {
                return actualExp.includes(i);
            });
            let x = Number(getVal(actualExp));
            let start = actualExp.indexOf(funcArr[funcArr.length - 1]);
            let addVal;
            switch (funcArr[funcArr.length - 1]) {
                case "log2(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.log2(x).toFixed(5);
                    break;
                case "log(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.log10(x).toFixed(5);
                    break;
                case "ln(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.log(x).toFixed(5);
                    break;
                case "abs(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.abs(x);
                    break;
                case "floor(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.floor(x);
                    break;
                case "ceil(":
                    x = evaluate(String(getVal(actualExp)));
                    addVal = Math.ceil(x);
                    break;
            }
            actualExp = actualExp.slice(0, start);
            actualExp += addVal;
        }
        currentDisplay.value = actualExp + " = ";
        input.focus();
    }
}
//DEG to RAD flip button EventListener
flipBtn.addEventListener("click", () => {
    if (degMode)
        degMode = false;
    else
        degMode = true;
    const flipBtns = document.getElementsByClassName("button-flip");
    for (let i = 0; i < flipBtns.length; i++) {
        flipBtns[i].classList.toggle("d-none");
    }
});
// Trigonometry and functions dropdown EventListener
dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", (e) => {
        let element = e.target;
        if (element.tagName === "DIV")
            element.lastElementChild.classList.toggle("d-flex");
    });
});
/*----------------------- Memory functionalities Handler ------------------------*/
function memoryHandler(obj) {
    const parent = obj.parentElement?.parentElement;
    let MCBtn = parent?.firstElementChild
        ?.firstElementChild;
    let MRBtn = parent?.firstElementChild?.nextElementSibling
        ?.firstElementChild;
    let val = obj.getAttribute("value");
    switch (val) {
        case "MS":
            if (!input.value)
                input.value = "0";
            else
                input.value = String(evaluate(actualExp));
            memoryDisplay.value = input.value;
            memoryDisplay.parentElement?.classList.remove("invisible");
            memory = input.value;
            MCBtn.disabled = false;
            MRBtn.disabled = false;
            currentDisplay.value = "";
            actualExp = input.value;
            break;
        case "MC":
            memoryDisplay.value = "";
            memoryDisplay.parentElement?.classList.add("invisible");
            MCBtn.disabled = true;
            MRBtn.disabled = true;
            memory = "";
            input.value = "";
            actualExp = "";
            break;
        case "MR":
            if (input.value === "undefined") {
                input.value = "";
            }
            if (!calc.operators.includes(input.value.slice(-1)) && input.value) {
                input.value += "*" + memory;
                actualExp += "*" + memory;
            }
            else {
                input.value += memory;
                actualExp += memory;
            }
            currentDisplay.value = actualExp;
            break;
        case "M+":
            memoryOperation("+");
            break;
        case "M-":
            memoryOperation("-");
            break;
    }
    if (isNaN(Number(memory))) {
        showAlert("Invalid");
        memory = "";
        memoryDisplay.value = "";
    }
    function memoryOperation(operation) {
        input.value = String(evaluate(actualExp));
        if (isNaN(Number(input.value))) {
            input.value = "0";
        }
        memoryDisplay.value =
            operation === "+"
                ? String(Number(memoryDisplay.value) + Number(input.value))
                : String(Number(memoryDisplay.value) - Number(input.value));
        memoryDisplay.parentElement?.classList.remove("invisible");
        MCBtn.disabled = false;
        MRBtn.disabled = false;
        memory = memoryDisplay.value;
        currentDisplay.value = "";
        actualExp = input.value;
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
// Handles the floatingPoint related work
function flotingPointHandler() {
    if (actualExp === "") {
        showAlert("Enter Number first");
        return;
    }
    if (getVal(actualExp)?.includes(".")) {
        return;
    }
    else {
        input.value += ".";
        actualExp += ".";
        currentDisplay.value = actualExp + "=";
    }
}
// Handles the sign(+ -) related work
function signHandler() {
    if (input.value.slice(-1) === ")") {
        let start = input.value.lastIndexOf("(");
        if (input.value[start - 2]) {
            if (input.value[start - 1] !== "-") {
                input.value =
                    input.value.slice(0, start) + "-" + input.value.slice(start);
                let x = evaluate(String(getVal(actualExp)));
                actualExp = actualExp.slice(0, actualExp.lastIndexOf("(")) + x * -1;
            }
            else if (input.value[start - 1] === "-" &&
                calc.operators.includes(input.value[start - 2])) {
                input.value =
                    input.value.slice(0, start - 1) + input.value.slice(start);
                let x = evaluate(String(getVal(actualExp)));
                if (x < 0 &&
                    !calc.operators.includes(actualExp[actualExp.lastIndexOf("-") - 1]))
                    actualExp = actualExp.slice(0, actualExp.lastIndexOf("-") + 1) + x;
                else
                    actualExp = actualExp.slice(0, actualExp.lastIndexOf("-")) + x * -1;
            }
            else {
                input.value =
                    input.value.slice(0, start) + "-" + input.value.slice(start);
                let x = evaluate(String(getVal(actualExp)));
                if (actualExp.slice(-1) !== ")" && actualExp.includes("-"))
                    actualExp = actualExp.slice(0, actualExp.lastIndexOf("-") + 1) + x;
                else if (actualExp.slice(-1) !== ")")
                    actualExp = "-" + actualExp;
                else
                    actualExp = actualExp.slice(0, start) + x * -1;
            }
        }
        else {
            if (input.value[0] !== "-")
                input.value = "-" + input.value;
            else
                input.value = input.value.slice(1);
            let x = evaluate(String(getVal(actualExp)));
            actualExp = String(x * -1);
        }
    }
    else {
        let x = getVal(actualExp);
        if (!x || x.slice(-1) === "(")
            return;
        if (actualExp[actualExp.lastIndexOf(x) - 1] &&
            actualExp[actualExp.lastIndexOf(x) - 1].match(/[0-9]/) &&
            actualExp.slice(-1) !== ")") {
            actualExp = actualExp.slice(0, actualExp.lastIndexOf(x) + 1) + x;
            input.value = input.value.slice(0, input.value.lastIndexOf(x) + 1) + x;
        }
        else {
            let y = Number(x) * -1;
            actualExp = actualExp.slice(0, actualExp.lastIndexOf(x)) + y;
            input.value = input.value.slice(0, input.value.lastIndexOf(x)) + y;
        }
    }
    actualExp = String(actualExp);
    if (actualExp.includes("---")) {
        currentDisplay.value = actualExp;
        currentDisplay.value = currentDisplay.value.replace("---", "-");
    }
    else if (actualExp.includes("--")) {
        currentDisplay.value = actualExp;
        currentDisplay.value = currentDisplay.value.replace("--", "+");
    }
    else
        currentDisplay.value = actualExp;
}
// Handles F-E button
function fractionalToExp() {
    let val = getVal(actualExp);
    if (val) {
        let addVal = Number(val).toExponential(4);
        input.value = input.value.slice(0, input.value.lastIndexOf(val)) + addVal;
        currentDisplay.value = input.value;
    }
}
// Flips the column of fns to some new fns.
function flipCol() {
    const flipBtn = document.getElementById("flipCol");
    flipBtn.classList.toggle("color-blue");
    const hiddenBtns = document.getElementsByClassName("flip-btns");
    for (let i = 0; i < hiddenBtns.length; i++) {
        hiddenBtns[i].classList.toggle("d-none");
    }
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
