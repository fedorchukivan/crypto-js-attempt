const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const { AES_ECB_cipher, AES_ECB_decipher } = require('./cbc-mode');
const { convert_to_word_array } = require('./helpers');
const { padding_PKCS7 } = require('./padding-pkcs7');

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
  const { encrypt, decrypt } = encryption_decryption_ECB_factory(32);
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

function emailPostfixGenerator() {
  const postfixes = ['@gmail.com', '@net.com'];
  return function () {
    return postfixes[crypto.randomInt(0, postfixes.length)];
  };
}

const random_letter = () => String.fromCharCode(crypto.randomInt(97, 122));
const random_number = () => String.fromCharCode(crypto.randomInt(48, 57));

function emailNameGenerator(length, result = '') {
  if (length <= 0) {
    return result;
  }
  return emailNameGenerator(length - 1, result + (Math.random() > 0.7 ? random_number() : random_letter()));
}

function emailGenerator() {
  const getPostfix = emailPostfixGenerator();
  return function (length, block_size) {
    const postfix = getPostfix();
    const value = length - postfix.length;
    const name = emailNameGenerator(value > 1 ? value : value + block_size);
    return name + postfix;
  };
}

function attacker(login, getEmail, block_size = 16) {
  const email_part = 'email=';
  const info_part = '&uid=10&role=';
  const admin_block = padding_PKCS7('admin', block_size).toString('utf-8');

  let count = (email_part + info_part).length % block_size;
  const email = getEmail(block_size - count, block_size);

  let cipher = login(email);
  const result = cipher.slice(0, (email_part + email + info_part).length * 2);

  const padding = Buffer.alloc(block_size - email_part.length, 'a').toString('utf-8');
  cipher = login(padding + admin_block);
  const admin_block_cipher = cipher.slice((email_part + padding).length * 2, (email_part + padding).length * 2 + block_size * 2);

  return result + admin_block_cipher;
}

module.exports = {
  registration_Factory,
  attacker,
  emailGenerator
};