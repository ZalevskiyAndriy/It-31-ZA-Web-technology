const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { read, write } = require('./utils/db');

const app = express();

app.use(express.static('public'));
app.use('/lib', express.static('node_modules/chart.js/dist')); // Chart.js
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'todo-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// тільки для залогінених
const isAuthenticated = (req, res, next) => {
  if (req.session.user) next();
  else res.status(401).json({ redirect: '/login.html' });
};

// перевірка результатів валідації
const checkErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const registerRules = [
  body('name').trim().isLength({ min: 3 }).withMessage("Введіть ПІБ (мінімум 3 символи)"),
  body('email').trim().isEmail().withMessage('Невірний формат email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль має містити мінімум 6 символів')
];

const titleMsg = 'Назва завдання: від 1 до 100 символів';
const priorityRule = body('priority').optional().isIn(['низька', 'середня', 'висока']).withMessage('Невірний пріоритет');

// правила для створення і для оновлення завдання
const createRules = [body('title').trim().isLength({ min: 1, max: 100 }).withMessage(titleMsg), priorityRule];
const updateRules = [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage(titleMsg),
  priorityRule,
  body('completed').optional().isBoolean().withMessage('Невірний статус')
];

// реєстрація
app.post('/api/register', registerRules, checkErrors, async (req, res) => {
  const { name, email, password } = req.body;
  const users = read('users.json');

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ errors: [{ msg: 'Користувач з таким email вже існує' }] });
  }

  const user = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    password: await bcrypt.hash(password, 12)
  };
  users.push(user);
  write('users.json', users);

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.status(201).json({ success: true });
});

// вхід
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = read('users.json').find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ errors: [{ msg: 'Неправильний email або пароль' }] });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true });
});

// вихід
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// поточний користувач
app.get('/api/me', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

// усі маршрути завдань — тільки для залогінених
app.use('/api/tasks', isAuthenticated);

app.get('/api/tasks', (req, res) => {
  const tasks = read('tasks.json').filter(t => t.userId === req.session.user.id);
  res.json(tasks);
});

app.post('/api/tasks', createRules, checkErrors, (req, res) => {
  const tasks = read('tasks.json');
  const task = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    userId: req.session.user.id,
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: req.body.priority || 'середня'
  };
  tasks.push(task);
  write('tasks.json', tasks);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', updateRules, checkErrors, (req, res) => {
  const tasks = read('tasks.json');
  const task = tasks.find(t => t.id === Number(req.params.id) && t.userId === req.session.user.id);
  if (!task) return res.status(404).json({ errors: [{ msg: 'Завдання не знайдено' }] });

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  if (req.body.completed !== undefined) task.completed = req.body.completed === true || req.body.completed === 'true';
  write('tasks.json', tasks);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = read('tasks.json');
  const index = tasks.findIndex(t => t.id === Number(req.params.id) && t.userId === req.session.user.id);
  if (index === -1) return res.status(404).json({ errors: [{ msg: 'Завдання не знайдено' }] });

  tasks.splice(index, 1);
  write('tasks.json', tasks);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));