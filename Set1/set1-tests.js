const { hexToBase64, fixedXOR, decipherSingleByteXOR, repeatingKeyXOR, breakRepeatingKeyXOR } = require('./set1');
const fs = require('node:fs');

const printDivider = () => {
  console.log('---------------------------------------------------\n');
}

const func = {
  'Hex to base64': hexToBase64,
  'Fixed XOR': fixedXOR,
  'Implement repeating-key XOR': repeatingKeyXOR
}

function checkTestCase({ name, params, expect }) {
  const result = func[name](...params);

  console.log(`${name}: ${
    result !== expect ?
    `failed!\nExpected:\t${expect}\nReceived:\t\t${result}` :
    'passed'
  }\n`);

  printDivider();
}

// fs.readFile('./set1-test-cases.json', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const testCases = JSON.parse(data);
//   testCases.forEach(checkTestCase);
// });


// fs.readFile('./../english-probability.json', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const frequencies = JSON.parse(data);

//   const res = decipherSingleByteXOR(
//     Buffer.from('1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736', 'hex'),
//     frequencies
//   );

//   console.log('Deciphering single-byte XOR\n');
//   console.log(
//     `Iteration:\t${res.iteration}\nMessage:\t${res.message}\nScore:\t\t${res.score}\n`
//   );
//   printDivider();
// });

// fs.readFile('./hex-strings.txt', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const stringsBytes = data.toString().split('\n').map(str => Buffer.from(str, 'hex'));

//   fs.readFile('./../english-probability.json', (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
  
//     const frequencies = JSON.parse(data);

//     const results = stringsBytes.map(str => decipherSingleByteXOR(str, frequencies));

//     const res = results.reduce((min, res) => res.score < min.score ? res : min);

//     console.log('Deciphering hex strings file\n');
//     console.log(`Message:\t${res.message}\nScore:\t\t${res.score}\n`);
//     printDivider();
//   });
// });

fs.readFile('./../english-probability.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const frequencies = JSON.parse(data);

  fs.readFile('./base64-strings.txt', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const result = breakRepeatingKeyXOR(data.toString('ascii'), frequencies);

    console.log(`Key: ${result.key}\n`);
    console.log('Message:');
    console.log(result.message);
  })
});