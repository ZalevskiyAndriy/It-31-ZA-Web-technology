const fs = require("fs");

const inputFile = "mydata.txt";
const outputFile = "result.txt";

fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
        console.error("Помилка читання файлу:", err);
        return;
    }

    console.log("Вміст mydata.txt:");
    console.log(data);

    const newData =
        data +
        "\nНепарний варіант - додано студентом Залевський Андрій";

    fs.writeFile(outputFile, newData, "utf8", (err) => {
        if (err) {
            console.error("Помилка запису файлу:", err);
            return;
        }

        console.log("Результат збережено у файл result.txt");
    });
});