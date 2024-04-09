const { Buffer } = require('node:buffer');

const byte_iterator = function (string) {
    let index = 0;
    const arr = Buffer.from(string)
    return {
        next: function () {
            index = index < arr.length ? index : 0;
            return arr.at(index++);
        }
    }
}

function repeatingKeyXOR(string, key) {
    const key_byte_g = byte_iterator(key);
    const res = Buffer.from(Buffer.from(string).map(el => key_byte_g.next() ^ el)).toString('hex');
    return res;
}

module.exports = {
    repeatingKeyXOR
}