const { Buffer } = require('node:buffer');
const { repeatingKeyXOR } = require('./repeating-key-xor');
const { decipherSingleByteXOR } = require('./decipher-single-byte-xor');

function hamming_distance(bytes_A, bytes_B) {
    return bytes_A.reduce((res, uint8, index) => {
        const xor_res = bytes_B.at(index) ^ uint8;
        let buff = 0;
        for (let i = 0; i < 8; i++) {
            const mask = 1 << i;
            buff += (xor_res & mask) >> i;
        }
        return res + buff;
    }, 0)
}

function breakRepeatingKeyXOR(string, frequencies) {
    const input_string = Buffer.from(string, 'base64');
    const key_size = findKeySize(input_string);
    
    const byte_by_groups = input_string.reduce((arr, byte, index) => {
        const group_index = index % key_size;
        if (arr[group_index] !== undefined) {
            arr[group_index].push(byte);
        } else {
            arr[group_index] = [byte]
        }
        return arr;
    }, []);
    
    const key = byte_by_groups.map(arr => decipherSingleByteXOR(arr, frequencies).iteration);
    console.log(key);
    return Buffer.from(repeatingKeyXOR(input_string, key), 'hex').toString('utf-8');
}

function findKeySize(string) {
    const result = {};
    for (let key_size = 2; key_size <= 40; key_size++) {
        const first = string.subarray(0, key_size);
        const second = string.subarray(key_size, key_size * 2);
        const res = hamming_distance(first, second) / key_size;
        if (!result.value || result.value > res) {
            result.index = key_size;
            result.value = res;
        }
    }
    return result.index;
}

module.exports = {
    breakRepeatingKeyXOR
}