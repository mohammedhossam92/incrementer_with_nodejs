// Simple utility to encode URL components
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the text to encode: ', (text) => {
  const encoded = encodeURIComponent(text);
  console.log('\nEncoded text:');
  console.log(encoded);
  rl.close();
});