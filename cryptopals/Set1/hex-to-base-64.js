const { Buffer } = require('node:buffer');

function hexToBase64(hexString) {
  return Buffer.from(hexString, 'hex').toString('base64'); 
}

module.exports = {
  hexToBase64
};