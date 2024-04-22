const { Buffer } = require('node:buffer');
const CryptoJS = require('crypto-js');

function xor_buffer(buff_a, buff_b) {
    if (buff_b.length < buff_a.length) {
        return xor_buffer(buff_b, buff_a);
    }
    return buff_a.map((el, i) => el ^ buff_b.at(i));
}

function AES_CBC_cipher(key, message, iv) {
    const local_key = CryptoJS.enc.Hex.parse(key);
    let input = Buffer.from(message, 'utf-8');
    let prev = Buffer.from(iv, 'hex');
    const result = [iv];
    const filler = 16 - input.length % 16;
    const tail = Buffer.alloc(filler, filler);

    input = Buffer.concat([input, tail]);

    for (let i = 0; i <= input.length - 16; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const xor_res = xor_buffer(chunk, prev);
        const text = CryptoJS.enc.Hex.parse(xor_res.toString('hex'));
        const encrypted = CryptoJS.AES.encrypt(text, local_key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
        const curr = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        result.push(curr);
        prev = Buffer.from(curr, 'hex');
    }
    return result.join('');
}


function AES_CBC_decipher(key, cipherText) {
    const local_key = CryptoJS.enc.Hex.parse(key);
    const input = Buffer.from(cipherText, 'hex');
    const result = [];
    let prev = input.subarray(0, 16);

    for (let i = 16; i <= input.length - 16; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const ciphertext = CryptoJS.enc.Hex.parse(chunk.toString('hex'));
        const curr = CryptoJS.AES.decrypt({ ciphertext }, local_key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding }).toString();
        const xor_res = xor_buffer(Buffer.from(curr, 'hex'), prev);
        result.push(xor_res);
        prev = chunk;
    }
    const last_el = result[result.length - 1];
    result[result.length - 1] = last_el.subarray(0, 16 - last_el.at(15));
    return result.map(el => el.toString('utf-8')).join('');
}

function increment(buff) {
    let i = buff.length - 1;
    while(buff[i] === 0b11111111){
        buff[i] = 0;
        i--;
    }
    buff[i] += 1;
}

function AES_CTR_cipher(key, message, iv) {
    const local_key = CryptoJS.enc.Hex.parse(key);
    let input = Buffer.from(message, 'utf-8');
    let prev = Buffer.from(iv, 'hex');
    const result = [iv];  

    for (let i = 0; i <= input.length; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const text = CryptoJS.enc.Hex.parse(prev.toString('hex'));
        const encrypted = CryptoJS.AES.encrypt(text, local_key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
        let curr = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        curr = xor_buffer(chunk, Buffer.from(curr, 'hex'));
        result.push(curr.toString('hex'));
        increment(prev);
    }
    return result.join('');
}

function AES_CTR_decipher(key, cipherText) {
    const local_key = CryptoJS.enc.Hex.parse(key);
    const input = Buffer.from(cipherText, 'hex');
    const prev = input.subarray(0, 16);
    const result = [];

    for (let i = 16; i <= input.length; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const text = CryptoJS.enc.Hex.parse(prev.toString('hex'));
        const encrypted = CryptoJS.AES.encrypt(text, local_key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });
        let curr = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        curr = xor_buffer(chunk, Buffer.from(curr, 'hex'));
        result.push(curr.toString('utf-8'));
        increment(prev);
    }
    return result.join('');
}


const key_cbc = '140b41b22a29beb4061bda66b6747e14';
const case_cbc = ['4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81',
    '5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253'];
case_cbc.forEach(el => console.log(AES_CBC_decipher(key_cbc, el)));

const key_ctr = '36f18357be4dbd77f050515c73fcf9f2';
const case_ctr = ['69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329',
    '770b80259ec33beb2561358a9f2dc617e46218c0a53cbeca695ae45faa8952aa0e311bde9d4e01726d3184c34451'];
case_ctr.forEach(el => console.log(AES_CTR_decipher(key_ctr, el)));

module.exports = {
    AES_CBC_cipher,
    AES_CBC_decipher,
    AES_CTR_cipher,
    AES_CTR_decipher
};