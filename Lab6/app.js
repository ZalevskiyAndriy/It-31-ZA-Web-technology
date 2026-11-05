const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const tasksFile = path.join(__dirname, 'data', 'tasks.json');

// Middleware для роботи з JSON
app.use(express.json());

// Middleware для статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для логування запитів
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
    next();
});

// Функція читання завдань
function readTasks() {
    const data = fs.readFileSync(tasksFile, 'utf8');
    return JSON.parse(data);
}

// Функція запису завдань
function writeTasks(tasks) {
    fs.writeFileSync(
        tasksFile,
        JSON.stringify(tasks, null, 2),
        'utf8'
    );
}

// GET /api/tasks
// Отримати всі завдання
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = readTasks();

        res.json(tasks);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Помилка при отриманні завдань'
        });
    }
});

// GET /api/tasks/:id
// Отримати завдання за ID
app.get('/api/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();

        const id = Number(req.params.id);

        const task = tasks.find(task => task.id === id);

        if (!task) {
            return res.status(404).json({
                message: 'Завдання не знайдено'
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Помилка сервера'
        });
    }
});

// POST /api/tasks
// Додати нове завдання
app.post('/api/tasks', (req, res) => {
    try {
        const tasks = readTasks();

        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: 'Потрібно вказати title та description'
            });
        }

        const newId = tasks.length > 0
            ? Math.max(...tasks.map(task => task.id)) + 1
            : 1;

        const newTask = {
            id: newId,
            title: title,
            description: description,
            status: 'active'
        };

        tasks.push(newTask);

        writeTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Помилка при додаванні завдання'
        });
    }
});

// PUT /api/tasks/:id
// Змінити статус або опис завдання
app.put('/api/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();

        const id = Number(req.params.id);

        const task = tasks.find(task => task.id === id);

        if (!task) {
            return res.status(404).json({
                message: 'Завдання не знайдено'
            });
        }

        const { description, status } = req.body;

        if (description !== undefined) {
            task.description = description;
        }

        if (status !== undefined) {
            if (status !== 'active' && status !== 'done') {
                return res.status(400).json({
                    message: 'Статус може бути тільки active або done'
                });
            }

            task.status = status;
        }

        writeTasks(tasks);

        res.json(task);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Помилка при оновленні завдання'
        });
    }
});

// DELETE /api/tasks/:id
// Видалити завдання
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();

        const id = Number(req.params.id);

        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            return res.status(404).json({
                message: 'Завдання не знайдено'
            });
        }

        const deletedTask = tasks.splice(taskIndex, 1)[0];

        writeTasks(tasks);

        res.json({
            message: 'Завдання видалено',
            task: deletedTask
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Помилка при видаленні завдання'
        });
    }
});

// Обробка невідомих API-маршрутів
app.use('/api', (req, res) => {
    res.status(404).json({
        message: 'API маршрут не знайдено'
    });
});

// Обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        message: 'Помилка сервера'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});