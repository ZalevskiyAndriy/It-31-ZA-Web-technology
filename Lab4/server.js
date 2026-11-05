
const http = require('http');
const fs = require('fs');

const student = {
    name: 'Залевський Андрій',
    group: 'ІТ-31',
    message: 'Я вчуся працювати з Node.js!'
};


if (!fs.existsSync('student.json')) {
    fs.writeFileSync(
        'student.json',
        JSON.stringify(student, null, 2),
        'utf8'
    );
}

const server = http.createServer((req, res) => {

    // Головна сторінка
    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(`
            <h1>Головна сторінка</h1>
            <p>Ласкаво просимо на сервер Node.js!</p>
            <p><a href="/about">Про нас</a></p>
            <p><a href="/student">Інформація про студента (JSON)</a></p>
            <p><a href="/student/html">Інформація про студента (HTML)</a></p>
        `);

    // Сторінка "Про нас"
    } else if (req.url === '/about') {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(`
            <h1>Про нас</h1>
            <p>Це простий HTTP-сервер, створений за допомогою Node.js.</p>
        `);


    } else if (req.url === '/student') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });

        res.end(JSON.stringify(student, null, 2));


    } else if (req.url === '/student/html') {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end(`
            <h1>Інформація про студента</h1>
            <ul>
                <li><strong>Ім'я:</strong> ${student.name}</li>
                <li><strong>Група:</strong> ${student.group}</li>
                <li><strong>Повідомлення:</strong> ${student.message}</li>
            </ul>
        `);

    // Якщо маршрут не знайдено
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8'
        });

        res.end('<h1>404 - Сторінку не знайдено</h1>');
    }
});

// Запускаємо сервер на порту 3000
server.listen(3000, () => {
    console.log('Сервер запущено на http://localhost:3000');
});
