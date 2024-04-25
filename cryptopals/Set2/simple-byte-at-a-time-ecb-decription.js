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

function findKeySizeForEncryptionOracle(encryptionOracle) {
    let keySize = 1;
    const char = 'a';
    let message = char;
    let prevCipher = encryptionOracle(message).slice(0, keySize*2);
    
    while(keySize <= 32) {
        keySize += 1;
        message += char;
        
        const cipher = encryptionOracle(message).slice(0, keySize*2);

        if(cipher.startsWith(prevCipher)) {
            break;
        }

        prevCipher = cipher;
    }

    return keySize - 1;
}

module.exports = {
    encryptionOracleFactoryECB
};