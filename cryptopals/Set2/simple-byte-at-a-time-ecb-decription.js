const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { convert_to_word_array } = require('./helpers');
const { AES_ECB_cipher } = require('./cbc-mode');

function encryptionOracleFactoryECB(appendage, keySize = 16) {
  const key = crypto.randomBytes(keySize);
  const keyWA = convert_to_word_array(key);

  return function (message) {
    const appendageBytes = Buffer.from(appendage, 'base64');
    const messageBytes = Buffer.from(message, 'utf-8');

    const plaintextBuffer = Buffer.concat([messageBytes, appendageBytes]);

    const plaintextWA = convert_to_word_array(plaintextBuffer);
    return AES_ECB_cipher(keyWA, plaintextWA);
  };
}

module.exports = {
  encryptionOracleFactoryECB
};