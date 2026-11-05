const express = require('express');
const { readData, writeData } = require('../db');

const router = express.Router();

// список + фільтр за назвою
router.get('/', (req, res) => {
  let data = readData();
  const title = req.query.title;
  if (title) {
    data = data.filter(s => s.title.toLowerCase().includes(title.toLowerCase()));
  }
  res.json(data);
});

// додати
router.post('/', (req, res) => {
  const { title, seasons } = req.body;
  if (!title || !seasons) return res.status(400).json({ message: 'Заповніть всі поля' });

  const data = readData();
  const id = data.length ? data[data.length - 1].id + 1 : 1;
  const item = { id, title, seasons: Number(seasons) };
  data.push(item);
  writeData(data);
  res.status(201).json(item);
});

// оновити
router.put('/:id', (req, res) => {
  const data = readData();
  const item = data.find(s => s.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Не знайдено' });

  item.title = req.body.title;
  item.seasons = Number(req.body.seasons);
  writeData(data);
  res.json(item);
});

// видалити
router.delete('/:id', (req, res) => {
  const data = readData().filter(s => s.id !== Number(req.params.id));
  writeData(data);
  res.json({ message: 'Видалено' });
});

module.exports = router;