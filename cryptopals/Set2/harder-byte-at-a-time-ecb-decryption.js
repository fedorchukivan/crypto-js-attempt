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

function findKeySizeForEncryptionOracleWithPrefix(encryptionOracleWithPrefix) {
    const cipherA = encryptionOracleWithPrefix('A');
    const cipherB = encryptionOracleWithPrefix('B');
    const cipherC = encryptionOracleWithPrefix('C');
    let indexOfBlockStart = -1;
    let indexOfBlockEnd = -1;
    for(let i = 0; i < cipherA.length; i += 2) {
        if (
            cipherA.slice(i, i+1) !== cipherB.slice(i, i+1) ||
            cipherA.slice(i, i+1) !== cipherC.slice(i, i+1)
        ) {
            if (indexOfBlockStart === -1) {
                indexOfBlockStart = i / 2;
            } else {
                indexOfBlockEnd = i / 2;
            }
        }
    }

    let keySize = indexOfBlockEnd - indexOfBlockStart + 1;

    return keySize;
}

module.exports = {
    encryptionOracleWithPrefixFactoryECB
};