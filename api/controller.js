'use strict';

exports.calculate = function(req, res) {
  req.app.use(function(err, _req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    res.status(400);
    res.json({ error: err.message });
  });

  // TODO: Add operator
  var operations = {
    'add':      function(a, b) { return Number(a) + Number(b) },
    'subtract': function(a, b) { return a - b },
    'multiply': function(a, b) { return a * b },
    'divide':   function(a, b) { return a / b },
    'power':    function(a, b) { return Math.pow(a, b) },
  };

  if (!req.query.operation) {
    throw new Error("Unspecified operation");
  }

  var operation = operations[req.query.operation];

  if (!operation) {
    throw new Error("Invalid operation: " + req.query.operation);
  }

  if (!req.query.operand1 ||
      !req.query.operand1.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
    throw new Error("Invalid operand1: " + req.query.operand1);
  }

  if (!req.query.operand2 ||
      !req.query.operand2.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand2.replace(/[-0-9e]/g, '').length > 1) {
    throw new Error("Invalid operand2: " + req.query.operand2);
  }

  res.json({ result: operation(req.query.operand1, req.query.operand2) });
};

// Tokenize an infix arithmetic expression into numbers, operators and parentheses.
// Supports decimals and exponential notation (e.g. 4.2e1).
function tokenize(input) {
  var tokens = [];
  var numberPattern = /^(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:e[+-]?[0-9]+)?/i;
  var i = 0;

  while (i < input.length) {
    var ch = input[i];

    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    if ('+-*/^()'.indexOf(ch) !== -1) {
      tokens.push(ch);
      i++;
      continue;
    }

    var match = input.slice(i).match(numberPattern);
    if (match) {
      tokens.push(Number(match[0]));
      i += match[0].length;
      continue;
    }

    throw new Error("Invalid character in expression: " + ch);
  }

  return tokens;
}

// Recursive-descent evaluator for + - * / ^ with the precedence required by the
// issue: ^ binds tighter than * and /, which bind tighter than + and -, and ^ is
// right-associative (2 ^ 3 ^ 2 === 2 ^ (3 ^ 2)).
function evaluateExpression(input) {
  var tokens = tokenize(input);
  var position = 0;

  function peek() {
    return tokens[position];
  }

  function consume() {
    return tokens[position++];
  }

  function parseExpression() {
    var value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      var operator = consume();
      var right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    var value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      var operator = consume();
      var right = parseUnary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  function parseUnary() {
    if (peek() === '-') {
      consume();
      return -parseUnary();
    }
    if (peek() === '+') {
      consume();
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    var base = parsePrimary();
    if (peek() === '^') {
      consume();
      // Right-associative: the exponent is parsed as a unary expression so that
      // chained exponentiation and signed exponents (2 ^ -3) bind correctly.
      var exponent = parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePrimary() {
    var token = peek();

    if (token === '(') {
      consume();
      var value = parseExpression();
      if (consume() !== ')') {
        throw new Error("Mismatched parentheses");
      }
      return value;
    }

    if (typeof token === 'number') {
      consume();
      return token;
    }

    throw new Error("Unexpected token: " + (token === undefined ? "end of expression" : token));
  }

  if (tokens.length === 0) {
    throw new Error("Empty expression");
  }

  var result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("Unexpected token: " + tokens[position]);
  }

  return result;
}

exports.evaluate = function(req, res) {
  if (!req.query.expression) {
    res.status(400);
    res.json({ error: "Unspecified expression" });
    return;
  }

  try {
    var result = evaluateExpression(req.query.expression);

    if (Number.isNaN(result)) {
      throw new Error("Invalid expression: " + req.query.expression);
    }

    res.json({ result: result });
  } catch (err) {
    res.status(400);
    res.json({ error: err.message });
  }
};
