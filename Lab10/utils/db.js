const fs = require('fs');

function read(file) {
  try {
    return JSON.parse(fs.readFileSync(`data/${file}`, 'utf8'));
  } catch (err) {
    console.error('Помилка читання файлу:', err.message);
    return [];
  }
}

function write(file, data) {
  fs.writeFileSync(`data/${file}`, JSON.stringify(data, null, 2));
}

module.exports = { read, write };