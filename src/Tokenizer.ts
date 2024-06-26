import { ToyLangParserError } from "./ErrorReporter";

export enum TokenTypes {
  let = "let",
  if = "if",
  else = "else",
  while = "while",
  do = "do",
  for = "for",
  true = "true",
  false = "false",
  null = "null",
  def = "def",
  return = "return",
  class = "class",
  new = "new",
  this = "this",
  super = "super",
  extends = "extends",
  SEMI = "SEMI",
  CURLY_END = "CURLY_END",
  CURLY_START = "CURLY_START",
  PAREN_START = "PAREN_START",
  PAREN_END = "PAREN_END",
  COMMA = "COMMA",
  DOT = "DOT",
  BRACKET_END = "BRACKET_END",
  BRACKET_START = "BRACKET_START",
  STRING = "STRING",
  NUMBER = "NUMBER",
  IDENTIFIER = "IDENTIFIER",
  EQUALITY_OPERATOR = "EQUALITY_OPERATOR",
  SIMPLE_ASSIGNMENT = "SIMPLE_ASSIGNMENT",
  COMPLEX_ASSIGNMENT = "COMPLEX_ASSIGNMENT",
  ADDITITIVE_OPERATOR = "ADDITITIVE_OPERATOR",
  MULTIPLICATIVE_OPERATOR = "MULTIPLICATIVE_OPERATOR",
  RELATIONAL_OPERATOR = "RELATIONAL_OPERATOR",
  LOGICAL_AND = "LOGICAL_AND",
  LOGICAL_OR = "LOGICAL_OR",
  LOGICAL_NOT = "LOGICAL_NOT",
  EOF = "EOF",
}

const spec = [
  [/^\s+/, null],
  [/^\/\/.*/, null],
  [/^\/\*[\s\S]*?\*\//, null],

  // Symbols, Delimiters
  [/^;/, TokenTypes.SEMI],
  [/^\}/, TokenTypes.CURLY_END],
  [/^\{/, TokenTypes.CURLY_START],
  [/^\(/, TokenTypes.PAREN_START],
  [/^\)/, TokenTypes.PAREN_END],
  [/^\,/, TokenTypes.COMMA],
  [/^\./, TokenTypes.DOT],
  [/^\]/, TokenTypes.BRACKET_END],
  [/^\[/, TokenTypes.BRACKET_START],

  // keywords
  [/^\bBanao\b/, TokenTypes.let],
  [/^\bAgr\b/, TokenTypes.if],
  [/^\bWarna\b/, TokenTypes.else],
  [/^\bJabTak\b/, TokenTypes.while],
  [/^\bKaro\b/, TokenTypes.do],
  [/^\bfor\b/, TokenTypes.for],
  [/^\bSahi\b/, TokenTypes.true],
  [/^\bGhalat\b/, TokenTypes.false],
  [/^\bnull\b/, TokenTypes.null],
  [/^\bdef\b/, TokenTypes.def],
  [/^\bWapisBhejo\b/, TokenTypes.return],
  [/^\bclass\b/, TokenTypes.class],
  [/^\bnew\b/, TokenTypes.new],
  [/^\bthis\b/, TokenTypes.this],
  [/^\bsuper\b/, TokenTypes.super],
  [/^\bextends\b/, TokenTypes.extends],

  // Numbers
  [/^\d+/, TokenTypes.NUMBER],

  // Identifiers
  [/^\w+/, TokenTypes.IDENTIFIER],

  // Equality operators
  [/^[=!]=/, TokenTypes.EQUALITY_OPERATOR],

  // Assignment Operators
  [/^=/, TokenTypes.SIMPLE_ASSIGNMENT],
  [/^[\*\/\+\-]=/, TokenTypes.COMPLEX_ASSIGNMENT],

  // Math operators
  [/^[\+\-]/, TokenTypes.ADDITITIVE_OPERATOR],
  [/^[*\/]/, TokenTypes.MULTIPLICATIVE_OPERATOR],

  // relational operators
  [/^[><]=?/, TokenTypes.RELATIONAL_OPERATOR],

  // logical operators
  [/^&&/, TokenTypes.LOGICAL_AND],
  [/^\|\|/, TokenTypes.LOGICAL_OR],
  [/^!/, TokenTypes.LOGICAL_NOT],

  // Strings
  [/^"[^"\n]*"/, TokenTypes.STRING],
  [/^'[^'\n]*'/, TokenTypes.STRING],
];

export type Token = {
  type: TokenTypes;
  value: string;
  start: number;
  end: number;
};

export class Tokenizer {
  string!: string;
  cursor!: number;
  init(string: string) {
    this.string = string + "\n";
    this.cursor = 0;
  }

  hasMoreTokens() {
    return this.cursor < this.string.length;
  }

  isEOF() {
    return this.cursor === this.string.length;
  }

  getNextToken(): Token | null {
    if (!this.hasMoreTokens() || this.isEOF()) {
      return null;
    }

    const string = this.string.slice(this.cursor);

    for (let [regex, type] of spec) {
      const tokenValue = this._match(regex as RegExp, string);

      // cannot match rule, continue
      if (tokenValue === null) {
        continue;
      }

      // skip token (eg: whitespace)
      if (type === null) {
        return this.getNextToken();
      }

      return {
        type: type as TokenTypes,
        value: tokenValue,
        start: this.cursor - tokenValue.length - 1,
        end: this.cursor,
      };
    }

    const isStringUnfinished = string[0] === '"' || string[0] === "'";
    throw new ToyLangParserError({
      type: "SyntaxError",
      message: [
        isStringUnfinished
          ? `Unterminated string literal`
          : `Invalid token: "${string[0]}"`,
      ],
      code: this.string,
      loc: {
        start: this.cursor,
        end: this.cursor + 1,
      },
    });
  }

  _match(regex: RegExp, string: string) {
    const matched = regex.exec(string);
    if (matched === null) {
      return null;
    }

    this.cursor += matched[0].length;
    return matched[0];
  }

  static tokenTypeToName(type: string) {
    const nameMap = {
      [TokenTypes.SEMI]: ";",
      [TokenTypes.IDENTIFIER]: "Identifier",
      [TokenTypes.PAREN_END]: ")",
      [TokenTypes.PAREN_START]: "(",
      [TokenTypes.ADDITITIVE_OPERATOR]: "+",
      [TokenTypes.MULTIPLICATIVE_OPERATOR]: "*",
      [TokenTypes.NUMBER]: "Number",
      [TokenTypes.STRING]: "String",
      [TokenTypes.CURLY_START]: "{",
      [TokenTypes.CURLY_END]: "}",
      [TokenTypes.COMMA]: ",",
      [TokenTypes.DOT]: ".",
      [TokenTypes.BRACKET_START]: "[",
      [TokenTypes.BRACKET_END]: "]",
      [TokenTypes.EQUALITY_OPERATOR]: "== | !=",
      [TokenTypes.SIMPLE_ASSIGNMENT]: "=",
      [TokenTypes.COMPLEX_ASSIGNMENT]: "+= | -= | *= | /=",
      [TokenTypes.RELATIONAL_OPERATOR]: "< | > | <= | >=",
      [TokenTypes.LOGICAL_AND]: "&&",
      [TokenTypes.LOGICAL_OR]: "||",
      [TokenTypes.LOGICAL_NOT]: "!",
      ParenthesizedExpression: "( Expression )",
    };

    return nameMap?.[type as unknown as keyof typeof nameMap] || type;
  }

  static tokenTypesToNames(types: string[]) {
    return types.map((type) => {
      return this.tokenTypeToName(type);
    });
  }
}
