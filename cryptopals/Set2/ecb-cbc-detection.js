const crypto = require('node:crypto');

function randomKeyGeneration(bytes = 16) {
    const key = new Uint8Array(bytes);
    crypto.getRandomValues(key);

    return key;
}

module.exports = {
    randomKeyGeneration
};