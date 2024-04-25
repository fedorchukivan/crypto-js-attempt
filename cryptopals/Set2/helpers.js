const { Buffer } = require('node:buffer');
const CryptoJS = require('crypto-js');

function xor_buffer(buff_a, buff_b) {
    if (buff_b.length < buff_a.length) {
        return xor_buffer(buff_b, buff_a);
    }
    return buff_a.map((el, i) => el ^ buff_b.at(i));
}

function convert_to_word_array(message, encoding = 'utf-8') {
    let message_hex = '';
    if (Buffer.isBuffer(message)) {
        message_hex = message.toString('hex');
    } else if(Buffer.isEncoding(encoding)){
        message_hex = Buffer.from(message, encoding).toString('hex');
    } else {
        message_hex = Buffer.from(message).toString('hex');
    }
    return CryptoJS.enc.Hex.parse(message_hex);
}

module.exports = {
    convert_to_word_array,
    xor_buffer
};