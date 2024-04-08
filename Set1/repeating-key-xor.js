const { Buffer } = require('node:buffer');

const byte_generator = function (string) {
    let index = 0;
    const arr = [...Buffer.from(string)]
    return {
        get_key: function () {
            index = index < arr.length ? index : 0;
            return arr[index++];
        }
    }
}

function repeatingKeyXOR(string, key) {
    const key_byte_g = byte_generator(key);
    const res = Buffer.from(Buffer.from(string).map(el => key_byte_g.get_key() ^ el)).toString('hex');
    return res;
}

module.exports = {
    repeatingKeyXOR
}