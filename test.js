const { performance } = require('perf_hooks');

const str = 'abc';
let j = 0;

const t = performance.now();
for (let i = 0; i < 100000000; i++) {
  if (str.charCodeAt(1) === 98) {
    j++
  } else {
    j--
  }
  // if (str[1] === 'b') {
  //   j++
  // } else {
  //   j--
  // }
}

console.log(performance.now() - t);