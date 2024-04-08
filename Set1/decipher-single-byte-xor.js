const { Buffer } = require('node:buffer');

function compareFrequencies(comparative, comparator) {
  const total = Object.values(comparative).reduce((sum, val) => sum + val, 0);
  return (
    Object.keys(comparative).reduce((score, character) => {
      const a = comparative[character] / total * 100;
      const b = comparator[character] ?? 0;
      return score + Math.abs(b - a);
    }, 0)
  );
}

function decipherSingleByteXOR(hexString, frequencies) {
  const buff = Buffer.from(hexString, 'hex');
  
  const results = [];

  for (let i = 0; i <= 255; i++) {
    const characters = Buffer.from(buff.map(uint8 => uint8 ^ i)).toString('utf-8').split('');

    const summary = characters.reduce((sum, character) => {
      if (character !== ' ') {
        sum[character] = (
          sum[character] !== undefined ?
          sum[character] + 1 :
          1
        );
      }
      return sum;
    }, {});

    results.push({
      iteration: i,
      message: characters.join(''),
      score: compareFrequencies(summary, frequencies)
    });
  }

  return results.reduce((min, res) => res.score < min.score ? res : min);
}

module.exports = {
  decipherSingleByteXOR
}