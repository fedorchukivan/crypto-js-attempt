const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { convert_to_word_array } = require('./helpers');
const { AES_ECB_cipher } = require('./cbc-mode');

function encryptionOracleWithPrefixFactoryECB(secret, keySize = 16) {
    const prefixLength = crypto.randomInt(keySize/2, keySize*3/2);
    const prefixBuffer = crypto.randomBytes(prefixLength);

    const key = crypto.randomBytes(keySize);
    const keyWA = convert_to_word_array(key);

    const secretBuffer = Buffer.from(secret);

    return function (message) {
        const messageBuffer = Buffer.from(message);

        const plaintextBuffer = Buffer.concat([
            prefixBuffer,
            messageBuffer,
            secretBuffer
        ]);
        const plaintextWA = convert_to_word_array(plaintextBuffer);

        return AES_ECB_cipher(keyWA, plaintextWA);
    };
}

module.exports = {
    encryptionOracleWithPrefixFactoryECB
};