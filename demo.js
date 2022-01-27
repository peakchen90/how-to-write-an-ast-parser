const Parser = require('./parser');

// var abc = "abc"
const code = `
  var abc = "abc"
  alert(abc, 246)
`;

const ast = new Parser(code).parse();
console.log(JSON.stringify(ast, null, 2));
