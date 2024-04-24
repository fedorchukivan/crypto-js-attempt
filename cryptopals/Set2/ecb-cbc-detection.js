const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { convert_to_word_array } = require('./helpers');
const { AES_ECB_cipher, AES_CBC_cipher } = require('./cbc-mode');

function randomBytesGeneration(bytes_n = 16) {
    return crypto.randomBytes(bytes_n);
}

function encryptionOracle(message, AES_mode) {
    const key = randomBytesGeneration();
    const keyWA = convert_to_word_array(key);

    const frontNoiseBytes = randomBytesGeneration(crypto.randomInt(5, 11));
    const backNoiseBytes = randomBytesGeneration(crypto.randomInt(5, 11));

    const plaintextBuffer = Buffer.concat([
        frontNoiseBytes,
        Buffer.from(message, 'utf-8'),
        backNoiseBytes
    ]);

    const plaintextWA = convert_to_word_array(plaintextBuffer);
    const ECB_CBC_result = [
        () => {
            return AES_ECB_cipher(keyWA, plaintextWA);
        },
        () => {
            const randomIv = randomBytesGeneration().toString('hex');
            return AES_CBC_cipher(key, plaintextBuffer, randomIv);
        }
    ];

    return ECB_CBC_result[AES_mode ?? crypto.randomInt(2)];
}

module.exports = {
    encryptionOracle
};