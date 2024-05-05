import { Environment } from "./Environment";
import { tl } from "../typings";

import { CallableFunction, ToyLangFunction } from "./CallableFunction";
import { RuntimeError } from "./RuntimeError";
import { Return } from "./Return";
import { stdlib } from "./StdLib";

function checkNumberOperands(
  node: any,
  left: string | number,
  right: string | number
) {
  if (typeof left === "number" && typeof right === "number") return true;

  throw new RuntimeError("Operands must be numbers.", node);
}

function checkNumberOperand(node: any, operand: string | number) {
  if (typeof operand === "number") return;

  throw new RuntimeError("Operand must be number.", node);
}

/**
 * The Interpreter class is responsible for executing the abstract syntax tree (AST) of the ToyLang program.
 */
export class Interpreter {
  ast: tl.Program | null;
  globals: Environment;
  environment: Environment;

  /**
   * Creates an instance of the Interpreter class.
   */
  constructor() {
    this.ast = null;
    this.globals = new Environment();

    // Initialize standard library
    Object.keys(stdlib).forEach((libName) => {
      this.globals.add(
        libName,
        stdlib[libName as unknown as keyof typeof stdlib]
      );
    });

    this.environment = this.globals;
  }

  /**
   * Executes the given AST.
   * @param ast The abstract syntax tree to execute.
   * @returns The result of executing the AST.
   */
  execute(ast: tl.Program) {
    this.ast = ast;

    return this.visit(this.ast);
  }

  /**
   * Visits a node in the AST and performs the corresponding action based on the node's type.
   * @param node The node to visit.
   * @returns The result of visiting the node.
   */
  visit(
    node:
      | null
      | tl.Statement
      | tl.Expression
      | tl.UnaryExpression
      | tl.BinaryExpression
      | tl.CallExpression
      | tl.Program
      | tl.Literal
      | tl.Identifier
  ): number | string | CallableFunction | null | boolean | void {
    if (node == null) return;

    switch (node.type) {
      case "ExpressionStatement":
        return this.visitExpression(node);
      case "IfStatement":
        return this.visitIfStatement(node);
      case "WhileStatement":
        return this.visitWhileStatement(node);
      case "ForStatement":
        return this.visitForStatement(node);
      case "VariableStatement":
        return this.visitVariableStatement(node);
      case "BlockStatement":
        return this.visitBlockStatement(node);
      case "CallExpression":
        return this.visitCallExpression(node);
      case "UnaryExpression":
        return this.visitUnaryExpression(node);
      case "BinaryExpression":
        return this.visitBinaryExpression(node);
      case "LogicalExpression":
        return this.visitLogicalExpression(node);
      case "AssignmentExpression":
        return this.visitAssignmentExpression(node);
      case "FunctionDeclaration":
        return this.visitFunctionDeclaration(node);
      case "ReturnStatement":
        return this.visitReturnStatement(node);
      case "Program":
        return this.visitProgram(node);
      case "NumericLiteral":
      case "StringLiteral":
        return this.visitLiterals(node);
      case "Identifier":
        return this.visitIdentifier(node);

      default:
        return null;
    }
  }

  /**
   * Visits an Identifier node and retrieves its value from the environment.
   * @param node The Identifier node to visit.
   * @returns The value of the Identifier.
   */
  visitIdentifier(node: tl.Identifier): number | string | CallableFunction {
    return this.environment.get(node.name);
  }

  /**
   * Visits an ExpressionStatement node and visits its expression.
   * @param node The ExpressionStatement node to visit.
   * @returns The result of visiting the expression.
   */
  visitExpression(node: tl.ExpressionStatement) {
    return this.visit(node.expression);
  }

  /**
   * Visits an AssignmentExpression node and performs the corresponding assignment operation.
   * @param node The AssignmentExpression node to visit.
   * @returns The result of the assignment operation.
   */
  visitAssignmentExpression(node: tl.AssignmentExpression) {
    let value = this.visit(node.right);

    const left = node.left as tl.Identifier;
    let lhs = this.environment.get(left.name);

    switch (node.operator) {
      case "=":
        this.environment.assign(left.name, value);
        break;
      case "+=":
        lhs += value;
        this.environment.assign(left.name, lhs);
        break;
      case "-=":
        if (typeof value !== "number") {
          throw new RuntimeError("Operand must be a number", node);
        }
        lhs -= value;
        this.environment.assign(left.name, lhs);
        break;
      case "/=":
        if (typeof value !== "number") {
          throw new RuntimeError("Operand must be a number", node);
        }
        lhs /= value;
        this.environment.assign(left.name, lhs);
        break;
      case "*=":
        if (typeof value !== "number") {
          throw new RuntimeError("Operand must be a number", node);
        }
        lhs *= value;
        this.environment.assign(left.name, lhs);
        break;
    }

    return lhs;
  }

  /**
   * Visits a ReturnStatement node and throws a Return exception with the argument value.
   * @param node The ReturnStatement node to visit.
   * @throws Return exception with the argument value.
   */
  visitReturnStatement(node: tl.ReturnStatement) {
    let value = null;
    if (node.argument !== null) value = this.visit(node.argument);

    throw new Return(value);
  }

  /**
   * Visits a FunctionDeclaration node and adds the function to the environment.
   * @param node The FunctionDeclaration node to visit.
   * @returns null.
   */
  visitFunctionDeclaration(node: tl.FunctionDeclaration) {
    let fun = new ToyLangFunction(node, this.environment);
    this.environment.add(node.name.name, fun);
    return null;
  }

  /**
   * Visits a CallExpression node and calls the corresponding function.
   * @param node The CallExpression node to visit.
   * @returns The result of calling the function.
   */
  visitCallExpression(node: tl.CallExpression) {
    const callee = this.visit(node.callee) as CallableFunction;

    if ((!(callee as any).prototype as unknown) instanceof CallableFunction) {
      throw new RuntimeError("Can only call functions and classes", node);
    }

    const args = [];
    for (const argument of node.arguments) {
      args.push(this.visit(argument));
    }

    if (args.length != callee.arity() && callee.arity() !== Infinity) {
      throw new RuntimeError(
        "Expected " +
          callee.arity() +
          " arguments but got " +
          args.length +
          ".",
        node
      );
    }

    return callee.call(this, args);
  }

  /**
   * Visits a VariableStatement node and adds the variables to the environment.
   * @param node The VariableStatement node to visit.
   * @returns null.
   */
  visitVariableStatement(node: tl.VariableStatement) {
    for (const declaration of node.declarations) {
      let value = null;
      if (declaration.init != null) {
        value = this.visit(declaration.init);
      }

      this.environment.add(declaration.id.name, value);
      return null;
    }
    return null;
  }

  /**
   * Visits a BlockStatement node and executes the block of statements in a new environment.
   * @param node The BlockStatement node to visit.
   * @returns null.
   */
  visitBlockStatement(node: tl.BlockStatement) {
    this.executeBlock(node.body, new Environment(this.environment));
    return null;
  }

  /**
   * Executes a block of statements in the specified environment.
   * @param statements The statements to execute.
   * @param environment The environment in which to execute the statements.
   */
  executeBlock(statements: tl.Statement[], environment: Environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.visit(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  /**
   * Visits an IfStatement node and executes the corresponding branch based on the test condition.
   * @param node The IfStatement node to visit.
   * @returns null.
   */
  visitIfStatement(node: tl.IfStatement) {
    const test = this.visit(node.test);

    if (test) {
      this.visit(node.consequent);
    } else if (node.alternate !== null) {
      this.visit(node.alternate);
    }
    return null;
  }

  /**
   * Visits a WhileStatement node and executes the body as long as the test condition is true.
   * @param node The WhileStatement node to visit.
   * @returns null.
   */
  visitWhileStatement(node: tl.WhileStatement) {
    while (this.visit(node.test)) {
      this.visit(node.body);
    }
    return null;
  }

  /**
   * Visits a ForStatement node and executes the body for each iteration of the loop.
   * @param node The ForStatement node to visit.
   * @returns null.
   */
  visitForStatement(node: tl.ForStatement) {
    if (node.init === null && node.test === null && node.update === null) {
      for (;;) {
        this.visit(node.body);
      }
    }

    for (
      this.visit(node.init);
      this.visit(node.test);
      this.visit(node.update)
    ) {
      this.visit(node.body);
    }
    return null;
  }

  /**
   * Visits a BinaryExpression node and performs the corresponding binary operation.
   * @param node The BinaryExpression node to visit.
   * @returns The result of the binary operation.
   */
  visitBinaryExpression(node: tl.BinaryExpression) {
    const op = node.operator;

    let left = this.visit(node.left) as number;
    let right = this.visit(node.right) as number;

    switch (op) {
      case "==":
        return left == right;

      case "!=":
        return left != right;

      case "+":
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new RuntimeError(
          `Runtime: Mismatched type, cannot "${typeof left}" + "${typeof right}"`,
          node
        );

      case "-":
        checkNumberOperands(node, left, right);
        return left - right;

      case "/":
        checkNumberOperands(node, left, right);
        return left / right;

      case "*":
        checkNumberOperands(node, left, right);
        return left * right;

      case ">":
        checkNumberOperands(node, left, right);
        return left > right;

      case "<":
        checkNumberOperands(node, left, right);
        return left < right;

      case ">=":
        checkNumberOperands(node, left, right);
        return left >= right;

      case "<=":
        checkNumberOperands(node, left, right);
        return left <= right;
    }

    throw new Error("Runtime: Unknown Binary operation");
  }

  /**
   * Visits a LogicalExpression node and performs the corresponding logical operation.
   * @param node The LogicalExpression node to visit.
   * @returns The result of the logical operation.
   */
  visitLogicalExpression(node: tl.LogicalExpression) {
    const op = node.operator;

    let left = this.visit(node.left);
    let right = this.visit(node.right);

    switch (op) {
      case "&&":
        return left && right;
      case "||":
        return left || right;
    }

    throw new Error("Runtime: Unknown Logical operation");
  }

  /**
   * Visits a Literal node and returns its value.
   * @param node The Literal node to visit.
   * @returns The value of the Literal.
   */
  visitLiterals(node: tl.Literal) {
    switch (node.type) {
      case "NumericLiteral":
        return node.value;
      case "StringLiteral":
        return node.value;
      case "BooleanLiteral":
        return node.value;
      case "NullLiteral":
        return null;

      default:
        throw new SyntaxError("Runtime: Unexpected literal");
    }
  }

  /**
   * Visits a UnaryExpression node and performs the corresponding unary operation.
   * @param node The UnaryExpression node to visit.
   * @returns The result of the unary operation.
   */
  visitUnaryExpression(node: tl.UnaryExpression) {
    const right = this.visit(node.argument as tl.CallExpression);

    switch (node.operator) {
      case "-":
        checkNumberOperand(node, right as number);
        return -(right as number);
      case "+":
        return right;
      case "!":
        return !right;
    }

    return null;
  }

  /**
   * Visits a Program node and executes its body of statements.
   * @param node The Program node to visit.
   * @returns null.
   */
  visitProgram(node: tl.Program) {
    node.body.map((statement) => this.visit(statement));
    return null;
  }
}
