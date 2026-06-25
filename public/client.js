'use strict';

var value = 0;

// Accumulated expression prefix (completed operands and operators), e.g. "2+3^".
// The full expression is `expression` + the current entry shown on screen.
var expression = "";

// True when the next digit/decimal should start a fresh entry rather than append
// to the value currently on display.
var resetEntry = true;

// True immediately after `=`; the next digit starts a brand new calculation while
// the next operator continues from the displayed result.
var justEvaluated = false;

function evaluate(expressionString) {
    var uri = location.origin + "/arithmetic/evaluate";
    uri += "?expression=" + encodeURIComponent(expressionString);

    setLoading(true);

    var http = new XMLHttpRequest();
    http.open("GET", uri, true);
    http.onload = function () {
        setLoading(false);

        if (http.status == 200) {
            var response = JSON.parse(http.responseText);
            setValue(response.result);
        } else {
            setError();
        }
    };
    http.send(null);
}

function clearPressed() {
    setValue(0);

    expression = "";
    resetEntry = true;
    justEvaluated = false;
}

function clearEntryPressed() {
    setValue(0);
    resetEntry = true;
}

function numberPressed(n) {
    if (justEvaluated) {
        expression = "";
        justEvaluated = false;
        resetEntry = true;
    }

    var current = getValue().toString();

    if (resetEntry) {
        current = n.toString();
        // Keep replacing while the entry is just a leading zero.
        resetEntry = (current === '0');
    } else if (current.replace(/[-\.]/g, '').length < 8) {
        current += n;
    }

    setValue(current);
}

function decimalPressed() {
    if (justEvaluated) {
        expression = "";
        justEvaluated = false;
        resetEntry = true;
    }

    if (resetEntry) {
        setValue('0.');
        resetEntry = false;
    } else if (!getValue().toString().includes('.')) {
        setValue(getValue() + '.');
    }
}

function signPressed() {
    var value = getValue();

    if (value != 0) {
        setValue(-1 * value);
    }
}

function operationPressed(op) {
    // Continue building the expression from whatever is currently displayed,
    // whether that is a freshly typed operand or a previous result.
    justEvaluated = false;
    expression += getValue().toString() + op;
    resetEntry = true;
}

function equalPressed() {
    var fullExpression;

    if (resetEntry) {
        // No new operand was entered since the last operator: drop any trailing
        // operators and evaluate what we have.
        fullExpression = expression.replace(/[-+*/^]+$/, '');
        if (fullExpression === "") {
            fullExpression = getValue().toString();
        }
    } else {
        fullExpression = expression + getValue().toString();
    }

    expression = "";
    resetEntry = true;
    justEvaluated = true;

    evaluate(fullExpression);
}

// TODO: Add key press logics
document.addEventListener('keypress', (event) => {
    if (event.key.match(/^\d+$/)) {
        numberPressed(event.key);
    } else if (event.key == '.') {
        decimalPressed();
    } else if (event.key.match(/^[-*+/^]$/)) {
        operationPressed(event.key);
    } else if (event.key == '=') {
        equalPressed();
    }
});

function getValue() {
    return value;
}

function setValue(n) {
    value = n;
    var displayValue = value;

    if (displayValue > 99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < -99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue > 0 && displayValue < 0.0000001) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < 0 && displayValue > -0.0000001) {
        displayValue = displayValue.toExponential(3);
    }

    var chars = displayValue.toString().split("");
    var html = "";

    for (var c of chars) {
        if (c == '-') {
            html += "<span class=\"resultchar negative\">" + c + "</span>";
        } else if (c == '.') {
            html += "<span class=\"resultchar decimal\">" + c + "</span>";
        } else if (c == 'e') {
            html += "<span class=\"resultchar exponent\">e</span>";
        } else if (c != '+') {
            html += "<span class=\"resultchar digit" + c + "\">" + c + "</span>";
        }
    }

    document.getElementById("result").innerHTML = html;
}

function setError(n) {
    document.getElementById("result").innerHTML = "ERROR";
}

function setLoading(loading) {
    if (loading) {
        document.getElementById("loading").style.visibility = "visible";
    } else {
        document.getElementById("loading").style.visibility = "hidden";
    }

    var buttons = document.querySelectorAll("BUTTON");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = loading;
    }
}
