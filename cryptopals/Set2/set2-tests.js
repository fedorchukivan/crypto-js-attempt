const { padding_PKCS7 } = require('./set2');
const { createCheckTestCase } = require('./../check-test-case.js');

const fs = require('node:fs');

const func = {
  'Padding PKCS7': padding_PKCS7,
};

const checkTestCase = createCheckTestCase(func);

fs.readFile('./set2-test-cases.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const testCases = JSON.parse(data);
  testCases.forEach(checkTestCase);
});