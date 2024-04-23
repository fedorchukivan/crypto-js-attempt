const { Buffer } = require('node:buffer');
const CryptoJS = require('crypto-js');
const { padding_PKCS7 } = require('./padding-pkcs7');
const { convert_to_word_array, xor_buffer } = require('./helpers');

/**
 * Return hex string
 */
function AES_ECB_cipher(keyWA, messageWA) {
    const encrypted = CryptoJS.AES.encrypt(messageWA, keyWA,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.ZeroPadding
        });
    return encrypted.ciphertext.toString();
}

/**
 * Return hex string
 */
function AES_ECB_decipher(keyWA, cipherTextWA) {
    const curr = CryptoJS.AES.decrypt({ ciphertext:cipherTextWA }, keyWA,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.ZeroPadding
        }).toString();
    return curr;
}


function AES_CBC_cipher(key, message, iv, options) {
    const keyWA = convert_to_word_array(key, options?.key_encoding)
    const input = padding_PKCS7(message, 16, { input_encoding: options?.input_encoding ?? 'utf-8' });
    let prev = Buffer.from(iv, 'hex');
    const result = [iv];

    for (let i = 0; i <= input.length - 16; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const xor_res = xor_buffer(chunk, prev);
        const textWA = convert_to_word_array(xor_res);
        const curr = AES_ECB_cipher(keyWA, textWA);
        result.push(curr);
        prev = Buffer.from(curr, 'hex');
    }
    return result.join('');
}

function AES_CBC_decipher(key, cipherText, options) {
    const keyWA = convert_to_word_array(key, options?.key_encoding)
    const input = Buffer.from(cipherText, options?.input_encoding ?? 'hex');
    const result = [];
    let prev = input.subarray(0, 16);

    for (let i = 16; i <= input.length - 16; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const cipherTextWA = convert_to_word_array(chunk);
        const curr = AES_ECB_decipher(keyWA, cipherTextWA);
        const xor_res = xor_buffer(Buffer.from(curr, 'hex'), prev);
        result.push(xor_res);
        prev = chunk;
    }
    const last_el = result[result.length - 1];
    result[result.length - 1] = last_el.subarray(0, 16 - last_el.at(15));
    return result.map(el => el.toString('utf-8')).join('');
}

module.exports = {
    AES_ECB_cipher,
    AES_ECB_decipher,
    AES_CBC_cipher,
    AES_CBC_decipher
}

const key = 'YELLOW SUBMARINE';
const iv = Buffer.alloc(16).toString('hex');
const message = 'like like like like';
const encoded = AES_CBC_cipher(key, message, iv);
const decoded = AES_CBC_decipher(key, encoded)
console.log(decoded === message ? 'passed' : 'failed')