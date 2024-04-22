const { Buffer } = require('node:buffer');
const CryptoJS = require('crypto-js')

function xor_buffer(buff_a, buff_b) {
    if (buff_b.length < buff_a.length) {
        return xor_buffer(buff_b, buff_a);
    }
    return buff_a.map((el, i) => el ^ buff_b.at(i))
}

function AES_ECB_decipher(key, cipherText) {
    const local_key = CryptoJS.enc.Utf8.parse(key);
    const input = CryptoJS.enc.Hex.parse(cipherText);
    const result = CryptoJS.AES.decrypt({ ciphertext: input }, local_key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }).toString();
    return Buffer.from(result, 'hex').toString('utf-8');
}

module.exports = {
    AES_ECB_decipher
}