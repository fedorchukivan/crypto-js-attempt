const { Buffer } = require('node:buffer');
const {
  hexToBase64,
  fixedXOR,
  repeatingKeyXOR,
  breakRepeatingKeyXOR,
  decipherSingleByteXOR,
  AES_ECB_decipher
} = require('../set1');
const { printDivider, createCheckTestCase } = require('./../../check-test-case');
const { fsReadFactory } = require('../../fs-read-factory');

const func = {
  'Hex to base64': hexToBase64,
  'Fixed XOR': fixedXOR,
  'Implement repeating-key XOR': repeatingKeyXOR
};

const checkSimpleTestCase = createCheckTestCase(func);

function checkSimpleTestCases(data) {
  const testCases = JSON.parse(data);
  testCases.forEach(checkSimpleTestCase);
}

function checkDecipherSingleByteXOR(data) {
  const frequencies = JSON.parse(data);

  const res = decipherSingleByteXOR(
    Buffer.from('1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736', 'hex'),
    frequencies
  );

  console.log('Deciphering single-byte XOR\n');
  console.log(
    `Iteration:\t${res.iteration}\nMessage:\t${res.message}\nScore:\t\t${res.score}\n`
  );
  printDivider();
}

const checkResultDetectSingleByteXOR = fsReadFactory(
  './../data/english-probability.json',
  (data, stringsBytes) => {
    const frequencies = JSON.parse(data);

    const results = stringsBytes.map(str => decipherSingleByteXOR(str, frequencies));

    const res = results.reduce((min, res) => res.score < min.score ? res : min);

    console.log('Deciphering hex strings file\n');
    console.log(`Message:\t${res.message}\nScore:\t\t${res.score}\n`);
    printDivider();
  }
);

function checkDetectSingleByteXOR(data) {
  const stringsBytes = (
    data
    .toString()
    .split('\n')
    .map(str => Buffer.from(str, 'hex'))
  );

  checkResultDetectSingleByteXOR(stringsBytes);
}

const checkResultBreakRepeatingKeyXOR = fsReadFactory(
  './../data/english-probability.json',
  (data, base64_strings) => {
    const frequencies = JSON.parse(data);
    const result = breakRepeatingKeyXOR(base64_strings, frequencies);

    console.log('Deciphering file, encrypted with repeating XOR key\n');
    console.log(`Key: ${result.key}\n`);
    console.log('Message:');
    console.log(result.message);
    printDivider();
  }
);

function checkBreakRepeatingKeyXOR(data) {
  const base64_strings = data.toString('ascii');

  checkResultBreakRepeatingKeyXOR(base64_strings);
}

function check_AES_ECB_deciphering(data) {
  const key = 'YELLOW SUBMARINE';
  const cipherText = (
    data
    .toString()
    .split('\n')
    .map(str => Buffer.from(str, 'base64')
    .toString('hex'))
    .join('')
  );

  const result = AES_ECB_decipher(key, cipherText)
  console.log('Deciphering file, encrypted by AES ECB with known key\n');
  console.log(`Key: ${key}\n`);
  console.log('Message:');
  console.log(result);
  printDivider();
}

function checkDetectingCipherECB(data) {
  const texts = (
    data
    .toString()
    .split('\n')
    .map(str => Buffer.from(str, 'hex'))
  );

  const result = texts.reduce((prev, textBuffer) => {
    const repeatsStatistic = {};
    for (let i = 0; i < textBuffer.length; i += 16) {
      const chunk = textBuffer.subarray(i, i + 16).toString('hex');
      if (repeatsStatistic[chunk] === undefined) {
        repeatsStatistic[chunk] = 0;
      } else {
        repeatsStatistic[chunk] += 1;
      }
    }

    const score = Object.values(repeatsStatistic).reduce((totalRepeats, repeats) => totalRepeats + repeats);
    if (prev.count < score) {
      return { text: textBuffer.toString('hex'), count: score };
    }
    return prev;
  }, {
    text: '',
    count: -1,
  });

  console.log('Detecting ECB encrypted text\n');
  console.log(`Cipher Text: ${result.text}\nECB key count: ${result.count}`);
  printDivider();
}

const testsData = [
  {
    func: checkSimpleTestCases,
    path: './set1-test-cases.json'
  },
  {
    func: checkDecipherSingleByteXOR,
    path: './../data/english-probability.json'
  },
  {
    func: checkDetectSingleByteXOR,
    path: './../data/hex-strings.txt'
  },
  {
    func: checkBreakRepeatingKeyXOR,
    path: './../data/base64-strings.txt'
  },
  {
    func: check_AES_ECB_deciphering,
    path: './../data/aes-in-ecb-mode.txt'
  },
  {
    func: checkDetectingCipherECB,
    path: './../data/ecb-cipher-text.txt'
  }
];

const testRunner = testsData.reduceRight((next, test) => {
  return fsReadFactory(test.path, test.func, next);
}, undefined);

printDivider();
testRunner();
