const fs = require('node:fs');

function fsReadFactory(path, callback, next) {
  return function (...params) {
    fs.readFile(path, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
    
      callback(data, ...params);

      if (next !== undefined) {
        next();
      }
    });
  };
}

module.exports = {
  fsReadFactory
};