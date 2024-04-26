const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { convert_to_word_array } = require('./helpers');
const { AES_ECB_cipher } = require('./cbc-mode');
const { decryptUnknownEncryptionOracleAppendage } = require('./set2');

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

function isolatePrefixFromEncryptionOracle(encryptionOracleWithPrefix, keySize) {
    const char = 'a';
    let input = char;
    let prevCipher = encryptionOracleWithPrefix(input);
    input += char;
    let currCipher = encryptionOracleWithPrefix(input);

    const getStableBytes = function(prev, curr) {
        let stableBytes = 0;
        for(let i = 0; i < prevCipher.length; i += 2) {
            if (prev.slice(i, i+1) === curr.slice(i, i+1)) {
                stableBytes++;
            } else {
                break;
            }
        }
        return stableBytes;
    };
    let initialStableBytes = getStableBytes(prevCipher, currCipher);
    initialStableBytes -= initialStableBytes % keySize;

    let stableBytes = initialStableBytes;
    while(stableBytes - initialStableBytes < keySize) {
        prevCipher = currCipher;
        input += char;
        currCipher = encryptionOracleWithPrefix(input);
        stableBytes = getStableBytes(prevCipher, currCipher);
        stableBytes -= stableBytes % keySize;
    }

    input = input.slice(0, input.length - 1);

    const encryptionOracle = function(message) {
        const fullResult = encryptionOracleWithPrefix(input + message);
        return fullResult.slice(stableBytes * 2);
    };
    
    return encryptionOracle;
}

function decryptSecretFromEncryptionOracleWithPrefix(encryptionOracleWithPrefix) {
    const keySize = findKeySizeForEncryptionOracleWithPrefix(encryptionOracleWithPrefix);

    const encryptionOracle = isolatePrefixFromEncryptionOracle(encryptionOracleWithPrefix, keySize);
    return decryptUnknownEncryptionOracleAppendage(encryptionOracle);
}

const eO = encryptionOracleWithPrefixFactoryECB('&uid=526&role=user');
console.log(decryptSecretFromEncryptionOracleWithPrefix(eO));

module.exports = {
    encryptionOracleWithPrefixFactoryECB,
    decryptSecretFromEncryptionOracleWithPrefix
};