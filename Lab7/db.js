const fs = require('fs');

const FILE = 'data/series.json';

function readData() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    console.error('Помилка читання файлу:', err.message);
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };