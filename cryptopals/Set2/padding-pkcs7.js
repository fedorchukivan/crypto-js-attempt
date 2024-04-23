const { Buffer } = require('node:buffer');

function padding_PKCS7(buffer, block_length = 16, options) {
    if (!Buffer.isBuffer(buffer)) {
        const input_encoding = options?.input_encoding ?? 'utf-8';
        return padding_PKCS7(Buffer.from(buffer, input_encoding), block_length, options);
    }
    const filler = block_length - buffer.length % block_length;
    const tail = Buffer.alloc(filler, filler);
    const result = Buffer.concat([buffer, tail]);
    return options?.output_encoding ? result.toString(options.output_encoding) : result;
}

module.exports = {
    padding_PKCS7
};
