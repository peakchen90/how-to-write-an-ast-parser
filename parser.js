/**
 * 判断是一个数字字符
 */
function isNumberChar(char) {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57; // 0-9
}

/**
 * 判断是一个标识符字符
 */
function isIdentifierChar(char) {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) // A-Z a-z
}

const KEYWORD_LIST = ['var'];

class Parser {
  constructor(input) {
    this.input = input; // 解析的原文本字符串
    this.pos = 0; // 光标位置
    this.currentToken = null; // 当前读取的 Token
  }

  /**
   * 开始解析
   */
  parse() {
    const node = {
      type: 'Program',
      body: []
    }
    this.readNextToken();
    while (this.checkPosition()) {
      const statement = this.parseStatement();
      node.body.push(statement);
    }
    return node;
  }

  /**
   * 读取下一个 Token
   * (根据第一个字符来判断读取什么类型的 Token)
   */
  readNextToken() {
    let char = this.input[this.pos];

    // 跳过空白字符
    while (this.checkPosition()) {
      if (char === ' ' || char === '\r' || char === '\n' || char === '\t') {
        char = this.input[++this.pos];
      } else {
        break;
      }
    }

    // 光标超过边界
    if (!this.checkPosition()) {
      return this.currentToken = {type: 'EOF', value: 'EOF'};
    }

    if (isNumberChar(char)) { // 读取一个数字类型 Token
      let value = '';
      while (isNumberChar(char) && this.checkPosition()) {
        value += char;
        char = this.input[++this.pos];
      }
      this.currentToken = {type: 'NUMBER', value};
      return this.currentToken;
    } else if (isIdentifierChar(char)) { // 读取一个标识符类型 Token
      let value = '';
      while (isIdentifierChar(char) && this.checkPosition()) {
        value += char;
        char = this.input[++this.pos];
      }
      if (KEYWORD_LIST.includes(value)) {
        this.currentToken = {type: 'KEYWORD', value};
      } else {
        this.currentToken = {type: 'IDENTIFIER', value};
      }
      return this.currentToken;
    } else if (char === '"') { // 读取一个字符串 Token
      char = this.input[++this.pos];
      let value = '';
      while (char !== '"' && this.checkPosition()) {
        value += char;
        char = this.input[++this.pos];
      }
      this.pos++; // 跳过字符串右侧的 `"` 字符
      this.currentToken = {type: 'STRING', value};
      return this.currentToken;
    }

    // 读取一些单字符 Token
    switch (char) {
      case '=':
        this.pos++;
        return this.currentToken = {type: 'EQ', value: '='};
      case '(':
        this.pos++;
        return this.currentToken = {type: 'PAREN_L', value: '('};
      case ')':
        this.pos++;
        return this.currentToken = {type: 'PAREN_R', value: ')'};
      case ',':
        this.pos++;
        return this.currentToken = {type: 'COMMA', value: ','};
      default:
        throw new SyntaxError('Unexpected token: ' + char);
    }
  }

  /**
   * 解析语句
   * (根据第一个 Token 类型来决定怎么解析语句)
   */
  parseStatement() {
    const token = this.currentToken;

    if (token.type === 'KEYWORD') {
      if (token.value === 'var') { // 解析变量声明语句
        const node = {
          type: 'VariableDeclaration',
          id: null,
          init: null
        }

        // 读取变量名
        this.readNextToken();
        if (this.currentToken.type === 'IDENTIFIER') {
          node.id = this.currentToken.value;
        } else {
          throw new SyntaxError('Error');
        }

        // 读取 `=`
        this.readNextToken();
        if (this.currentToken.type !== 'EQ') {
          throw new SyntaxError('Error');
        }

        // 读取变量声明初始值
        this.readNextToken();
        node.init = this.parseExpression();
        return node;
      }
    } else if (token.type === 'IDENTIFIER') {
      return {
        type: 'ExpressionStatement',
        expression: this.parseExpression(),
      }
    }

    throw new SyntaxError('Unexpected token: ' + token.value);
  }

  /**
   * 解析表达式
   */
  parseExpression() {
    const token = this.currentToken;

    if (token.type === 'IDENTIFIER') {
      this.readNextToken();
      if (this.currentToken.type === 'PAREN_L') { // 函数调用
        const node = {
          type: 'CallExpression',
          callee: token.value,
          arguments: []
        }

        this.readNextToken();
        while (this.checkPosition()) {
          const arg = this.parseExpression();
          node.arguments.push(arg);
          if (this.currentToken.type === 'COMMA') { // 多个参数
            this.readNextToken();
          } else if (this.currentToken.type === 'PAREN_R') {
            this.readNextToken();
            break;
          } else {
            throw new SyntaxError('Error');
          }
        }

        return node;
      } else {
        return {
          type: 'Identifier',
          name: token.value
        }
      }
    } else if (token.type === 'NUMBER') {
      this.readNextToken();
      return {
        type: 'NumericLiteral',
        value: token.value
      }
    } else if (token.type === 'STRING') {
      this.readNextToken();
      return {
        type: 'StringLiteral',
        value: token.value
      }
    }
  }

  /**
   * 检查光标位置是否有效
   */
  checkPosition() {
    return this.pos < this.input.length;
  }


}

module.exports = Parser;
