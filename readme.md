# Rekhta: A Toy Language for Exploring Compiler Construction


## Introduction

Rekhta is a toy language designed to provide a hands-on learning experience for understanding compiler construction principles while also creating an accessible language for non-programmers. It aims to bridge the gap between theoretical concepts and practical implementation, offering a platform for experimentation and exploration.

## Motivation

Rekhta addresses two primary goals:

1. **Learning Tool:** To provide a practical environment for individuals interested in learning about compiler design. By constructing a compiler for Rekhta, I gained valuable insights into parsing, code generation, and other core aspects of compiler development.

2. **Accessible Language:** To create a language with Urdu syntax that is intuitive and easy to grasp for those without a strong programming background. This makes Rekhta a potential tool for enabling non-programmers to perform basic computational tasks, particularly Urdu speakers who may find traditional programming languages less familiar.

## Language Design

Rekhta incorporates the following key features:

- **Urdu Syntax:** Keywords are replaced with their Urdu equivalents, such as `banao` for `let`, `agar` for `if`, and `jab tak` for `while`, enhancing the language's naturalness for Urdu speakers and making it more approachable for those unfamiliar with English-based programming languages.

- **Limited Scope:** Rekhta currently focuses on fundamental programming elements like data types, operators, control flow statements, and functions. This simplifies the compiler design while still providing a foundation for basic programming tasks.

- **LL(1) Lookahead Parsing:** The parser leverages the LL(1) lookahead technique, a well-established parsing method that ensures efficient and accurate parsing of the code.

- **Abstract Syntax Tree (AST):** The parsed code is represented as an AST, facilitating efficient code generation and interpretation.

## Implementation Details

The Rekhta project is organized into well-defined folders:

- `binop`: Handles binary operations like addition, subtraction, etc.
- `class`: (Placeholder) Future implementation of classes.
- `expression`: Represents and handles various types of expressions.
- `identifiers`: Manages variable names and their scopes.
- `iterations`: Implements control flow constructs like `while` loops.
- `literals`: Represents literal values like numbers and strings.
- `statements`: Defines different statement types like assignments and function calls.
- `variables`: Manages variable declarations and their values.

The interpreter folder contains:

- `callableFunctions`: Handles function definitions and calls.
- `Environment`: Stores variable values and function definitions.
- `RETURN`: Represents the return statement.
- `RunTimeError`: Handles runtime errors like division by zero.
- `stdLib`: Provides built-in functions for common operations, similar to Python.

The main folder includes:

- `ASTFactorizers`: Generates the AST representation.
- `ErrorReporters`: Handles and reports errors during parsing and execution.
- `index`: The main entry point for the compiler (package).
- `Parser`: Implements the LL(1) parsing algorithm.
- `Tokenizzer`: Breaks the code into individual tokens and gives them class using enums.
- `typings`: Defines type information for variables and expressions as JavaScript.

## Sample Rekhta Code

```
def sirKoSalamKaro(sirKaNaam) {
    print("Salam Sir", sirKaNaam);
}

def factorialCalculateKarKDo(number) {
    agar (number == 0) {
        WapisBhejo 1;
    }
    WapisBhejo number * factorialCalculateKarKDo(number - 1);
}

def factorialIterationSe(n) {
    banao fac = 1;
    for (banao i = 1; i < n + 1; i += 1) {
        fac *= i;
    }
    WapisBhejo fac;
}

sirKoSalamKaro("Atif");
print("Factorial Calculate ho gya: ", factorialCalculateKarKDo(5));
print("Factorial Iterations se calculate hua: ", factorialIterationSe(5));

```
```

import { Interpreter } from "../src/interpreter/Interpreter";
import { Parser } from "../src/Parser";

const args = process.argv.slice(2);

if (!args) throw new Error("Please provide an example name");

run(args[0]);

function run(file: string) {
    const parser = new Parser();
    const interpreter = new Interpreter();

    const code = `
        // Sample Rekhta code goes here
    `;

    const ast = parser.parse(code);

    interpreter.execute(ast);
}
```
