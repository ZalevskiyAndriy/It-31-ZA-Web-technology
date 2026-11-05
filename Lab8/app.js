const express = require('express');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
app.set('view engine', 'ejs');

// middleware для логування запитів
function logger(req, res, next) {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
}

app.use(logger);
app.use(express.urlencoded({ extended: true })); // розбір даних форми

// сьогоднішня дата у форматі РРРР-ММ-ДД
const today = () => new Date().toLocaleDateString('en-CA');

// middleware валідації
const validateGift = [
  body('person').trim()
    .isLength({ min: 3, max: 50 }).withMessage("Ім'я обов'язкове, від 3 до 50 символів"),
  body('giftIdea').trim()
    .isLength({ max: 100 }).withMessage('Не більше 100 символів'),
  body('budget')
    .isFloat({ min: 0 }).withMessage('Бюджет має бути числом не менше 0'),
  body('dueDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Формат дати: РРРР-ММ-ДД').bail()
    .isISO8601({ strict: true }).withMessage('Такої дати не існує').bail()
    .custom(value => value >= today()).withMessage('Дата не може бути раніше сьогодні'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('form', {
        errors: errors.mapped(),
        old: req.body,
        success: false
      });
    }
    next();
  }
];

// сторінка з формою
app.get('/', (req, res) => {
  res.render('form', { errors: {}, old: {}, success: req.query.success === '1' });
});

// обробка форми
app.post('/gifts', validateGift, (req, res) => {
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  data.push({
    id: data.length ? data[data.length - 1].id + 1 : 1,
    person: req.body.person,
    giftIdea: req.body.giftIdea,
    budget: Number(req.body.budget),
    dueDate: req.body.dueDate,
    bought: req.body.bought === 'on'
  });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.redirect('/?success=1');
});

app.listen(3000, () => console.log('Server running on port 3000'));