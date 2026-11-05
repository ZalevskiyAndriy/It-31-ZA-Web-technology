const message = document.getElementById('message');

// повідомлення користувачу
function showMessage(text, ok) {
  message.textContent = text;
  message.className = ok ? 'message ok' : 'message';
}

// запит з JSON-даними
async function sendJson(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { ok: res.ok, data: await res.json() };
}

// текст помилок від сервера
function errorText(data) {
  return data.errors ? data.errors.map(e => e.msg).join('. ') : 'Помилка';
}

// форми входу та реєстрації
function authForm(id, url) {
  const form = document.getElementById(id);
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const { ok, data } = await sendJson(url, 'POST', Object.fromEntries(new FormData(form)));
    if (ok) location.href = '/dashboard.html';
    else showMessage(errorText(data));
  };
}
authForm('loginForm', '/api/login');
authForm('registerForm', '/api/register');

// дашборд
if (document.getElementById('taskForm')) startDashboard();

async function startDashboard() {
  const form = document.getElementById('taskForm');
  const taskId = document.getElementById('taskId');
  const title = document.getElementById('title');
  const priority = document.getElementById('priority');
  const saveBtn = document.getElementById('saveBtn');
  const list = document.getElementById('list');
  const percent = document.getElementById('percent');

  let tasks = [];
  let filter = 'all';
  let chart;

  // перевірка входу
  const me = await fetch('/api/me');
  if (!me.ok) {
    location.href = '/login.html';
    return;
  }
  const user = await me.json();
  document.getElementById('welcome').textContent = `Вітаємо, ${user.name}!`;

  // отримати завдання з сервера
  async function loadTasks() {
    const res = await fetch('/api/tasks');
    tasks = await res.json();
    render();
  }

  // показати список з урахуванням фільтра
  function render() {
    const today = new Date().toLocaleDateString('en-CA');
    const shown = tasks.filter(t => {
      if (filter === 'done') return t.completed;
      if (filter === 'todo') return !t.completed;
      if (filter === 'today') return new Date(t.createdAt).toLocaleDateString('en-CA') === today;
      return true;
    });

    list.innerHTML = '';
    shown.forEach(t => {
      const li = document.createElement('li');
      li.className = t.completed ? 'done' : '';
      li.innerHTML = `<span><span class="text"></span> <small>(${t.priority})</small></span>
        <span>
          <button class="toggle">${t.completed ? 'Повернути' : 'Виконати'}</button>
          <button class="edit alt">Редагувати</button>
          <button class="del">Видалити</button>
        </span>`;
      li.querySelector('.text').textContent = t.title; // textContent — без виконання HTML

      li.querySelector('.toggle').onclick = async () => {
        await sendJson(`/api/tasks/${t.id}`, 'PUT', { completed: !t.completed });
        loadTasks();
      };
      li.querySelector('.edit').onclick = () => {
        taskId.value = t.id;
        title.value = t.title;
        priority.value = t.priority;
        saveBtn.textContent = 'Зберегти';
      };
      li.querySelector('.del').onclick = async () => {
        await fetch(`/api/tasks/${t.id}`, { method: 'DELETE' });
        showMessage('Завдання видалено', true);
        loadTasks();
      };
      list.appendChild(li);
    });

    updateChart();
  }

  // діаграма виконаних / невиконаних
  function updateChart() {
    const done = tasks.filter(t => t.completed).length;
    const data = [done, tasks.length - done];
    percent.textContent = tasks.length
      ? `Виконано: ${Math.round(done / tasks.length * 100)}%`
      : 'Завдань поки немає';

    if (!chart) {
      chart = new Chart(document.getElementById('chart'), {
        type: 'doughnut',
        data: {
          labels: ['Виконано', 'Не виконано'],
          datasets: [{ data, backgroundColor: ['#00b894', '#d63031'] }]
        }
      });
    } else {
      chart.data.datasets[0].data = data;
      chart.update();
    }
  }

  // додати або змінити завдання
  form.onsubmit = async (e) => {
    e.preventDefault();
    const id = taskId.value;
    const { ok, data } = await sendJson(id ? `/api/tasks/${id}` : '/api/tasks', id ? 'PUT' : 'POST', {
      title: title.value,
      priority: priority.value
    });

    if (!ok) return showMessage(errorText(data));

    showMessage(id ? 'Завдання оновлено' : 'Завдання додано', true);
    form.reset();
    taskId.value = '';
    saveBtn.textContent = 'Додати';
    loadTasks();
  };

  // фільтри
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.onclick = () => {
      filter = btn.dataset.filter;
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    };
  });

  // вихід
  document.getElementById('logoutBtn').onclick = async () => {
    await fetch('/api/logout');
    location.href = '/login.html';
  };

  loadTasks();
}