const { Buffer } = require('node:buffer');
const CryptoJS = require('crypto-js');

function AES_ECB_decipher(key, cipherText) {
    const local_key = CryptoJS.enc.Utf8.parse(key);
    const input = CryptoJS.enc.Hex.parse(cipherText);
    
    const result = CryptoJS.AES.decrypt(
        { ciphertext: input },
        local_key,
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    ).toString();

    return Buffer.from(result, 'hex').toString('utf-8');
}

module.exports = {
    AES_ECB_decipher
};