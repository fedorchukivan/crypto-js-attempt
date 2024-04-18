const { Buffer } = require('node:buffer');

function fixedXOR(hexStringA, hexStringB) {
  const buffA = Buffer.from(hexStringA, 'hex');
  const buffB = Buffer.from(hexStringB, 'hex');
  return Buffer.from(buffA.map((uint8, index) => buffB.at(index) ^ uint8)).toString('hex');
}

module.exports = {
  fixedXOR
}