const { AES_CBC_decipher } = require('./cbc-mode.js');
const { padding_PKCS7 } = require('./padding-pkcs7.js');
const { encryptionOracle, detectionOracle_ECB_CBC } = require('./ecb-cbc-detection');
const { encryptionOracleFactoryECB, decryptUnknownEncryptionOracleAppendage } = require('./simple-byte-at-a-time-ecb-decryption');
const { attacker, registration_Factory, emailGenerator } = require('./ecb-cut-and-paste.js');
const { encryptionOracleWithPrefixFactoryECB, decryptSecretFromEncryptionOracleWithPrefix } = require('./harder-byte-at-a-time-ecb-decryption.js');

module.exports = {
  padding_PKCS7,
  AES_CBC_decipher,
  encryptionOracle,
  detectionOracle_ECB_CBC,
  encryptionOracleFactoryECB,
  decryptUnknownEncryptionOracleAppendage,
  registration_Factory,
  attacker,
  emailGenerator,
  encryptionOracleWithPrefixFactoryECB,
  decryptSecretFromEncryptionOracleWithPrefix
};