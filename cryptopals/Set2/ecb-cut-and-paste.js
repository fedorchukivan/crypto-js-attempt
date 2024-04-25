const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { AES_ECB_cipher, AES_ECB_decipher } = require('./cbc-mode');
const { convert_to_word_array } = require('./helpers');

function parsing_routine(message) {
  const pairs = message.split('&');
  const params = pairs.reduce((prev, curr) => {
    const values = curr.split('=');
    if (values.length === 2) {
      prev[values[0]] = values[1];
    }
    return prev;
  }, {});
  return params;
}

function profile_for() {
  const uid = 10;
  return function (email) {
    const local_email = email.split('&').join('').split('=').join('');
    return `email=${local_email}&uid=${uid}&role=user`;
  };
}

function encryption_decryption_ECB_factory(keySize = 16) {
  const key = crypto.randomBytes(keySize);
  const keyWA = convert_to_word_array(key);
  return {
    encrypt: function (message) {
      const messageWA = convert_to_word_array(message);
      return AES_ECB_cipher(keyWA, messageWA);
    },
    decrypt: function (cipher) {
      const cipherWA = convert_to_word_array(cipher, 'hex');
      return AES_ECB_decipher(keyWA, cipherWA);
    }
  };
}

function registration_Factory() {
  const getProfile = profile_for();
  const { encrypt, decrypt } = encryption_decryption_ECB_factory();
  return {
    login: function (email) {
      const profile = getProfile(email);
      return encrypt(profile);
    },
    getUser: function (cipher) {
      const decrypted_text = Buffer.from(decrypt(cipher), 'hex').toString('utf-8');
      const user = parsing_routine(decrypted_text);
      return Object.freeze(user);
    }
  };
}

function attacker(login, block_size = 16) {
  const email_part = 'email=';
  const info_part = '&uid=10&role=';
  let email_end = Buffer.alloc(block_size - email_part.length, 'a').toString('utf-8');
  const admin_block = 'admin' + Buffer.alloc(block_size - 'admin'.length, 0).toString('utf-8');

  let cipher = login(email_end + admin_block);
  const admin_cipher_block = cipher.slice(block_size * 2, block_size * 4);

  const count = (email_part + info_part).length % block_size;
  email_end = Buffer.alloc(block_size - count, 'a').toString('utf-8');
  cipher = login(email_end);

  return cipher.slice(0, (email_part + email_end + info_part).length * 2) + admin_cipher_block;
}

const { login, getUser } = registration_Factory();
let cipher = login('me');
console.log(getUser(cipher));
cipher = attacker(login);
console.log(getUser(cipher));

//todo
//detect block size
//create real email
// ecb change zero padding to pkcs7