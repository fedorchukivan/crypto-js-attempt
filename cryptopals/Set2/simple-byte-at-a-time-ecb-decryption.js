const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { convert_to_word_array } = require('./helpers');
const { AES_ECB_cipher } = require('./cbc-mode');

function encryptionOracleFactoryECB(appendage, keySize = 16) {
    const key = crypto.randomBytes(keySize);
    const keyWA = convert_to_word_array(key);

    return function (message) {
        const appendageBytes = Buffer.from(appendage, 'base64');
        const messageBytes = Buffer.from(message, 'utf-8');

        const plaintextBuffer = Buffer.concat([messageBytes, appendageBytes]);

        const plaintextWA = convert_to_word_array(plaintextBuffer);
        return AES_ECB_cipher(keyWA, plaintextWA);
    };
}

function findKeySizeForEncryptionOracle(encryptionOracle) {
    let keySize = 1;
    const char = 'a';
    let message = char;
    let prevCipher = encryptionOracle(message).slice(0, keySize*2);
    
    while(keySize <= 32) {
        keySize += 1;
        message += char;
        
        const cipher = encryptionOracle(message).slice(0, keySize*2);

        if(cipher.startsWith(prevCipher)) {
            break;
        }

        prevCipher = cipher;
    }

    return keySize - 1;
}

function isEncryptionOracleUsingECB(encryptionOracle, keySize = 16) {
    const blockSizeMessage = Buffer.alloc(keySize*2, 'a').toString();
    const cipherText = encryptionOracle(blockSizeMessage);
    return cipherText.slice(0, keySize*2) === cipherText.slice(keySize*2, keySize*4);
}

function decryptUnknownEncryptionOracleAppendage(encryptionOracle) {
    const keySize = findKeySizeForEncryptionOracle(encryptionOracle);
    
    if(!isEncryptionOracleUsingECB(encryptionOracle, keySize)) {
        return;
    }

    let secretMessage = '';
    let blockNumber = 0;
    let messageDecrypted = false;
    
    while(!messageDecrypted) {
        let padding = Buffer.alloc(keySize-1, 'a').toString();
        const indexOfBlockStart = blockNumber * keySize*2;
        const indexOfBlockEnd = indexOfBlockStart + keySize*2;

        for(let i = 0; i < keySize && !messageDecrypted; i++) {
            const cipher = encryptionOracle(padding).slice(indexOfBlockStart, indexOfBlockEnd);
            const knownMessage = padding + secretMessage;
            const knownBlockMessage = knownMessage.slice(indexOfBlockStart / 2);

            let done = false;
            for(let charCode = 0; charCode <= 255 && !done; charCode++) {
                const char = String.fromCharCode(charCode);
                const input = knownBlockMessage + char;
                const testCipher = encryptionOracle(input).slice(0, keySize*2);
                // console.log(input, '(', input.length, '): cipher:', testCipher, 'goal:', cipher);

                if(testCipher === cipher) {
                    if (charCode === 0) {
                        messageDecrypted = true;
                    } else {
                        secretMessage += char;
                    }
                    done = true;
                }
            }

            if(!done) {
                console.log('Unknown ', i+1, ' char of block ', blockNumber+1);
                return secretMessage;
            }

            padding = padding.slice(0, padding.length - 1);
        }

        blockNumber++;
    }

    return secretMessage;
} 

module.exports = {
    encryptionOracleFactoryECB,
    isEncryptionOracleUsingECB,
    decryptUnknownEncryptionOracleAppendage
};