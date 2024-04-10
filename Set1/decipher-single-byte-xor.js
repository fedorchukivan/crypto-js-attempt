const { Buffer } = require('node:buffer');

function compareFrequencies(comparative, comparator) {
  const total = Object.values(comparative).reduce((sum, val) => sum + val, 0);
  const characters = new Set(Object.keys(comparative).concat(Object.keys(comparator)));
  let score = 0;
  characters.forEach((character) => {
    const a = (
      comparative[character] !== undefined ?
      comparative[character] / total * 100 :
      0
    );
    const b = comparator[character] ?? 0;
    score += Math.abs(b - a);
  });
  return score;
}

const punctuation = [' ', ',', '.', '\n', '!', '?', '\''];

function decipherSingleByteXOR(bytes, frequencies) {
  const results = [];

  for (let i = 0; i <= 255; i++) {
    const characters = Buffer.from(bytes.map(uint8 => uint8 ^ i)).toString('utf-8').toLowerCase().split('');
    
    const summary = characters.reduce((sum, character) => {
      if (!punctuation.includes(character)) {
        const location = (
          frequencies[character] !== undefined ?
          character :
          'rubbish'
        );
        sum[location] = (
          sum[location] !== undefined ?
          sum[location] + 1 :
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