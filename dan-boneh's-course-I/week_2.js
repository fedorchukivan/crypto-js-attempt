const { Buffer } = require('node:buffer');
const crypto = require('node:crypto')

function xor_buffer(buff_a, buff_b) {
    return buff_a.map((el, i) => el ^ buff_b.at(i))
}

function AES_CBC_cipher(key, message, iv) {
    const local_key = Buffer.from(key, 'hex');
    let input = Buffer.from(message, 'utf-8');
    let prev = Buffer.from(iv, 'hex');
    const result = [iv]
    const filler = 16 - input.length % 16;
    const tail = Buffer.alloc(filler, filler);
    
    input = Buffer.concat([input, tail]);

    for (let i = 0; i <= input.length - 16; i += 16) {
        const chunk = input.subarray(i, i + 16);
        const xor_res = xor_buffer(chunk, prev);
        const cipher = crypto.createCipheriv('aes-128-ecb', local_key, null);
        let curr = cipher.update(xor_res);
        curr = Buffer.concat([curr, cipher.final()])
        result.push(curr.toString('hex'));
        prev = curr;
    }
    return result.join('');
}

function AES_CBC_decipher(key, cipherText) {
    const local_key = Buffer.from(key, 'hex');
    const input = Buffer.from(cipherText, 'hex');
    const result = [];
    let prev = input.subarray(0, 16);

    for (let i = 16; i <= input.length - 32; i += 32) {
        const chunk = input.subarray(i, i + 32);
        const decipher = crypto.createDecipheriv('aes-128-ecb', local_key, null);
        let curr = decipher.update(chunk);
        curr = Buffer.concat([curr, decipher.final()])
        const xor_res = xor_buffer(curr, prev);
        result.push(xor_res);
        prev = chunk.subarray(0, 16);
    }
    const last_el = result[result.length -1];
    result[result.length -1] = last_el.subarray(0, 16 - last_el.at(15));
    return result.map(el => el.toString('utf-8')).join('');
}


const key = '140b41b22a29beb4061bda66b6747e14'
const test_input = 'like like like like';
const cipher = AES_CBC_cipher(key, test_input, '2f77668a9dfbf8d5848b9eeb4a7145ca');
console.log(AES_CBC_decipher(key, cipher) === test_input);

const case_1 = '4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81'
//console.log(AES_CBC_decipher(key, case_1));