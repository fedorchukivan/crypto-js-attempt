const { Buffer } = require('node:buffer');

const byte_iterator = function (key) {
    let index = 0;
    let arr = undefined;
    if(typeof key === 'string'){
        arr =  Buffer.from(key);
    } else if(Buffer.isBuffer(key) || Array.isArray(key)){
        arr = key;
    }
    return function () {
        index = index < arr.length ? index : 0;
        return arr.at(index++);
    };
};

function repeatingKeyXOR(string, key) {
    const key_byte_g = byte_iterator(key);
    const res = Buffer.from(Buffer.from(string).map(el => key_byte_g() ^ el)).toString('hex');
    return res;
}

module.exports = {
    repeatingKeyXOR
};