const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const studentFile = path.join(__dirname, 'student.json');

const defaultStudent = {
    name: "Залевський Андрій",
    group: "ІТ-31",
    message: "Я вчуся працювати з Express.js!"
};


app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));


if (!fs.existsSync(studentFile)) {
    fs.writeFileSync(
        studentFile,
        JSON.stringify(defaultStudent, null, 2),
        'utf8'
    );
}


function getStudent() {
    const data = fs.readFileSync(studentFile, 'utf8');
    return JSON.parse(data);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'website.html'));
});

app.get('/student', (req, res) => {
    const student = getStudent();

    res.send(`
        <!DOCTYPE html>
        <html lang="uk">
        <head>
            <meta charset="UTF-8">
            <title>Інформація про студента</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                <h1>Інформація про студента</h1>

                <div class="card">
                    <p><strong>Ім'я:</strong> ${student.name}</p>
                    <p><strong>Група:</strong> ${student.group}</p>
                    <p><strong>Повідомлення:</strong> ${student.message}</p>
                </div>

                <a href="/">На головну</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/json', (req, res) => {
    const student = getStudent();

    res.json(student);
});

app.post('/update', (req, res) => {
    const updatedStudent = {
        name: req.body.name,
        group: req.body.group,
        message: req.body.message
    };

    fs.writeFileSync(
        studentFile,
        JSON.stringify(updatedStudent, null, 2),
        'utf8'
    );

    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});