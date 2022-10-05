import Lexer from 'lex'

// var Lexer = require("lex");
var lexer = new Lexer;

lexer.addRule(/\s+/, function () {
    /* skip whitespace */
});

// lexer.addRule(/[0-9]+/, function (lexeme) {
//     return lexeme
// });

lexer.addRule(/\$[\w]+\(((?!\+|\-|\*|\/).)*\)/, function (lexeme) {
    return lexeme; // symbols
});


lexer.addRule(/[\w]+/, function (lexeme) {
    return lexeme; // symbols
});

// lexer.addRule(/[a-z]/, function (lexeme) {
//     return lexeme; // symbols
// });

lexer.addRule(/[\(\+\-\*\/\)]/, function (lexeme) {
    return lexeme; // punctuation (i.e. "(", "+", "-", "*", "/", ")")
});

var factor = {
    precedence: 2,
    associativity: "left"
};

var term = {
    precedence: 1,
    associativity: "left"
};

function Parser(table) {
    this.table = table;
}

Parser.prototype.parse = function (input) {
    var length = input.length,
        table = this.table,
        output = [],
        stack = [],
        index = 0;

    while (index < length) {
        var token = input[index++];

        switch (token) {
        case "(":
            stack.unshift(token);
            break;
        case ")":
            while (stack.length) {
                var token = stack.shift();
                if (token === "(") break;
                else output.push(token);
            }

            if (token !== "(")
                throw new Error("Mismatched parentheses.");
            break;
        default:
            if (table.hasOwnProperty(token)) {
                while (stack.length) {
                    var punctuator = stack[0];

                    if (punctuator === "(") break;

                    var operator = table[token],
                        precedence = operator.precedence,
                        antecedence = table[punctuator].precedence;

                    if (precedence > antecedence ||
                        precedence === antecedence &&
                        operator.associativity === "right") break;
                    else output.push(stack.shift());
                }

                stack.unshift(token);
            } else output.push(token);
        }
    }

    while (stack.length) {
        var token = stack.shift();
        if (token !== "(") output.push(token);
        else throw new Error("Mismatched parentheses.");
    }

    return output;
};

var parser = new Parser({
    "+": term,
    "-": term,
    "*": factor,
    "/": factor
});

function parse(input) {
    lexer.setInput(input);
    var tokens = [], token;
    while (token = lexer.lex()) tokens.push(token);
    return parser.parse(tokens);
}

var operator = {
    "+": "add",
    "-": "sub",
    "*": "mul",
    "/": "div"
};

const parsed = (exp) => {
    var stack = [];//console.log(parse(exp))

    parse(exp).forEach(function (c) {
        switch (c) {
        case "+":
        case "-":
        case "*":
        case "/":
            var b = stack.pop();
            var a = stack.pop();
            stack.push(`${a}.${operator[c]}(${b})`);
            // stack.push(operator[c] + "(" + a + ", " + b + ")");
            break;
        default:
            stack.push(c);
        }
    });
    
    return stack.pop()
}

export {
    parsed,
    parse,
}