const { Buffer } = require('node:buffer');
const {
  AES_CBC_decipher,
  padding_PKCS7
} = require('../set2');
const { printDivider, createCheckTestCase } = require('./../../check-test-case');
const { fsReadFactory } = require('../../fs-read-factory');

const func = {
  'Padding PKCS7': padding_PKCS7,
};

const checkSimpleTestCase = createCheckTestCase(func);

function checkSimpleTestCases(data) {
  const testCases = JSON.parse(data);
  testCases.forEach(checkSimpleTestCase);
}

function checkAES_CBC_Mode(data) {
  const key = 'YELLOW SUBMARINE';
  const cipherText = (
    data
      .toString()
      .split('\n')
      .map(str => Buffer.from(str, 'base64')
        .toString('hex'))
      .join('')
  );

  const result = AES_CBC_decipher(key, cipherText, { iv: Buffer.alloc(16) });
  console.log('Deciphering file, encrypted by AES CBC with known key\n');
  console.log(`Key: ${key}\n`);
  console.log('Message:');
  console.log(result);
  printDivider();
}

const testsData = [
  {
    func: checkSimpleTestCases,
    path: './set2-test-cases.json'
  },
  {
    func: checkAES_CBC_Mode,
    path: './../data/ecb-ciphers.txt'
  }
];

const testRunner = testsData.reduceRight((next, test) => {
  return fsReadFactory(test.path, test.func, next);
}, undefined);

printDivider();
testRunner();
