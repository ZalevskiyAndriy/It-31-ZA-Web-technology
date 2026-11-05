
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const path = require('path');

const { readUsers, writeUsers } = require('./utils/db');
const {
    isAuthenticated,
    isNotAuthenticated
} = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Налаштування шаблонів і статичних файлів
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Налаштування сесій
app.use(session({
    secret: process.env.SESSION_SECRET || 'lab9-secret-change-this-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Flash-повідомлення
app.use(flash());

// Передавання повідомлень і старих даних у шаблони
app.use((req, res, next) => {
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    res.locals.oldInput = req.flash('oldInput')[0] || {};
    next();
});

// Головна сторінка
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    res.redirect('/login');
});

// Форма реєстрації
app.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register', { title: 'Реєстрація' });
});

// Перевірка даних реєстрації
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('ПІБ має містити від 3 до 30 символів.'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Введіть коректну email-адресу.')
        .bail()
        .normalizeEmail()
        .custom(async (email) => {
            const users = await readUsers();

            const exists = users.some(
                user => user.email.toLowerCase() === email.toLowerCase()
            );

            if (exists) {
                throw new Error('Цей email вже зареєстровано.');
            }

            return true;
        }),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль має містити щонайменше 6 символів.'),

    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Паролі не збігаються.')
];

// Обробка реєстрації
app.post('/register', isNotAuthenticated, registerValidation, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));
        req.flash('oldInput', {
            name: req.body.name || '',
            email: req.body.email || ''
        });

        return res.redirect('/register');
    }

    try {
        const users = await readUsers();
        const email = req.body.email.trim().toLowerCase();

        // Додаткова перевірка унікальності email
        if (users.some(user => user.email.toLowerCase() === email)) {
            req.flash('error', 'Цей email вже зареєстровано.');
            req.flash('oldInput', {
                name: req.body.name || '',
                email
            });

            return res.redirect('/register');
        }

        // Хешування пароля
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        const newUser = {
            id: crypto.randomUUID(),
            name: req.body.name.trim(),
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await writeUsers(users);

        // Авторизація після реєстрації
        req.session.user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };

        req.flash('success', 'Реєстрація успішна!');
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Помилка реєстрації:', error.message);
        req.flash('error', 'Не вдалося зареєструвати користувача.');
        req.flash('oldInput', {
            name: req.body.name || '',
            email: req.body.email || ''
        });

        return res.redirect('/register');
    }
});

// Форма входу
app.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login', { title: 'Вхід' });
});

// Обробка входу
app.post(
    '/login',
    isNotAuthenticated,
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Введіть коректну email-адресу.')
            .bail()
            .normalizeEmail(),

        body('password')
            .notEmpty()
            .withMessage('Введіть пароль.')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg));
            req.flash('oldInput', {
                email: req.body.email || ''
            });

            return res.redirect('/login');
        }

        try {
            const users = await readUsers();
            const email = req.body.email.trim().toLowerCase();

            const user = users.find(
                item => item.email.toLowerCase() === email
            );

            if (!user) {
                req.flash('error', 'Користувача з таким email не знайдено.');
                req.flash('oldInput', { email });
                return res.redirect('/login');
            }

            const passwordMatches = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!passwordMatches) {
                req.flash('error', 'Неправильний пароль.');
                req.flash('oldInput', { email });
                return res.redirect('/login');
            }

            // Оновлення ідентифікатора сесії після входу
            req.session.regenerate((error) => {
                if (error) {
                    console.error('Помилка сесії:', error.message);
                    return res.redirect('/login');
                }

                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };

                req.session.save((saveError) => {
                    if (saveError) {
                        console.error('Помилка збереження сесії:', saveError.message);
                        return res.redirect('/login');
                    }

                    res.redirect('/dashboard');
                });
            });
        } catch (error) {
            console.error('Помилка входу:', error.message);
            req.flash('error', 'Сталася помилка під час входу.');
            req.flash('oldInput', {
                email: req.body.email || ''
            });

            return res.redirect('/login');
        }
    }
);

// Захищена сторінка
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        title: 'Особистий кабінет',
        user: req.session.user
    });
});

// Вихід із системи
app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Помилка завершення сесії:', error.message);
            return res.redirect('/dashboard');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Обробка непередбачених помилок
app.use((error, req, res, next) => {
    console.error('Помилка сервера:', error.message);
    res.status(500).send('Внутрішня помилка сервера.');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});
