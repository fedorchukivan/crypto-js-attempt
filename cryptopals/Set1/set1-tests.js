const { AES_ECB_decipher, hexToBase64, fixedXOR, decipherSingleByteXOR, repeatingKeyXOR, breakRepeatingKeyXOR } = require('./set1');
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

  console.log(`${name}: ${result !== expect ?
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

// fs.readFile('./../english-probability.json', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const frequencies = JSON.parse(data);

//   fs.readFile('./base64-strings.txt', (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     const result = breakRepeatingKeyXOR(data.toString('ascii'), frequencies);

//     console.log(`Key: ${result.key}\n`);
//     console.log('Message:');
//     console.log(result.message);
//   })
// });

// fs.readFile('./../aes-in-ecb-mode.txt', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const key = 'YELLOW SUBMARINE'
//   const input_cipher = data.toString().split('\n').map(str => Buffer.from(str, 'base64').toString('hex')).join('');
//   console.log(AES_ECB_decipher(key, input_cipher))
// })

fs.readFile('./../ecb-cipher-text.txt', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const input_ciphers = data.toString().split('\n').map(str => Buffer.from(str, 'hex'));
  const result = input_ciphers.reduce((prev, curr) => {
    const result = {};
    for (let i = 0; i < curr.length; i += 16) {
      const chunk = curr.subarray(i, i + 16).toString('hex');
      if (result[chunk] === undefined) {
        result[chunk] = 0
      } else {
        result[chunk] += 1;
      }
    }

    const score = Object.values(result).reduce((sum, el) => sum + el);
    if(prev.count < score){
      return {key: curr.toString('hex'), count: score}
    }
    return prev;
  }, {
    key: '',
    count: -1,
  })
  console.log(`Cipher Text: ${result.key}\nECB key count: ${result.count}`)
})