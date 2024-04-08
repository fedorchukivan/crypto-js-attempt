const { hexToBase64, fixedXOR, decipherSingleByteXOR } = require('./set1');
const fs = require('node:fs');

const printDivider = () => {
  console.log('---------------------------------------------------\n');
}

const func = {
  'Hex to base64': hexToBase64,
  'Fixed XOR': fixedXOR,
}

function checkTestCase({ name, params, expect }) {
  const result = func[name](...params);

  console.log(`${name}: ${
    result !== expect ?
    `failed!\nExpected:\t${expect}\nReceived:\t${result}` :
    'passed'
  }\n`);

  printDivider();
}

fs.readFile('./set1-test-cases.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const testCases = JSON.parse(data);
  testCases.forEach(checkTestCase);
});

fs.readFile('./../english-probability.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const frequencies = JSON.parse(data);

  const res = decipherSingleByteXOR(
    '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736',
    frequencies
  );

  console.log('Deciphering single-byte XOR\n');
  console.log(
    `Iteration:\t${res.iteration}\nMessage:\t${res.message}\nScore:\t${res.score}\n`
  );
  printDivider();
});

fs.readFile('./hex-strings.txt', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const strings = data.toString().split('\n');

  fs.readFile('./../english-probability.json', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  
    const frequencies = JSON.parse(data);

    const results = strings.map(str => decipherSingleByteXOR(str, frequencies));

    const res = results.reduce((min, res) => res.score < min.score ? res : min);

    console.log('Deciphering hex strings file\n');
    console.log(`Message:\t${res.message}\nScore:\t\t${res.score}\n`);
    printDivider();
  });
});
