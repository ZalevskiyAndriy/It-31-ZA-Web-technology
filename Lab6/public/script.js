const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasks');


// Отримання всіх завдань
async function loadTasks() {

    try {

        const response = await fetch('/api/tasks');

        const tasks = await response.json();

        displayTasks(tasks);

    } catch (error) {

        console.error('Помилка:', error);

    }
}


// Відображення завдань
function displayTasks(tasks) {

    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {

        tasksContainer.innerHTML = '<p>Завдань немає.</p>';

        return;
    }

    tasks.forEach(task => {

        const taskElement = document.createElement('div');

        taskElement.className = 'task';

        if (task.status === 'done') {
            taskElement.classList.add('done');
        }

        taskElement.innerHTML = `
            <h3>${task.title}</h3>

            <p>${task.description}</p>

            <p>
                <strong>Статус:</strong>
                ${task.status}
            </p>

            <div class="task-buttons">

                ${
                    task.status === 'active'
                        ? `<button
                            class="done-button"
                            onclick="completeTask(${task.id})">
                            Виконано
                           </button>`
                        : ''
                }

                <button
                    class="delete-button"
                    onclick="deleteTask(${task.id})">
                    Видалити
                </button>

            </div>
        `;

        tasksContainer.appendChild(taskElement);
    });
}


// Додавання нового завдання
taskForm.addEventListener('submit', async event => {

    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    try {

        const response = await fetch('/api/tasks', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                title: title,
                description: description
            })

        });

        if (!response.ok) {

            const error = await response.json();

            alert(error.message);

            return;
        }

        taskForm.reset();

        loadTasks();

    } catch (error) {

        console.error('Помилка:', error);

    }
});


// Позначення завдання як виконаного
async function completeTask(id) {

    try {

        const response = await fetch(`/api/tasks/${id}`, {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                status: 'done'
            })

        });

        if (!response.ok) {

            const error = await response.json();

            alert(error.message);

            return;
        }

        loadTasks();

    } catch (error) {

        console.error('Помилка:', error);

    }
}


// Видалення завдання
async function deleteTask(id) {

    try {

        const response = await fetch(`/api/tasks/${id}`, {

            method: 'DELETE'

        });

        if (!response.ok) {

            const error = await response.json();

            alert(error.message);

            return;
        }

        loadTasks();

    } catch (error) {

        console.error('Помилка:', error);

    }
}


// Завантаження завдань після відкриття сторінки
loadTasks();