const API = '/api/series';

const form = document.getElementById('form');
const idInput = document.getElementById('id');
const titleInput = document.getElementById('title');
const seasonsInput = document.getElementById('seasons');
const saveBtn = document.getElementById('saveBtn');
const search = document.getElementById('search');
const list = document.getElementById('list');

// отримати список з сервера
async function load() {
  const res = await fetch(API + '?title=' + encodeURIComponent(search.value));
  const data = await res.json();

  list.innerHTML = '';
  data.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${s.title} — ${s.seasons} сез.</span>
      <span><button class="edit">Редагувати</button>
      <button class="del">Видалити</button></span>`;

    li.querySelector('.edit').onclick = () => {
      idInput.value = s.id;
      titleInput.value = s.title;
      seasonsInput.value = s.seasons;
      saveBtn.textContent = 'Зберегти';
    };
    li.querySelector('.del').onclick = async () => {
      await fetch(`${API}/${s.id}`, { method: 'DELETE' });
      load();
    };
    list.appendChild(li);
  });
}

// додати або оновити
form.onsubmit = async (e) => {
  e.preventDefault();
  const id = idInput.value;

  await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titleInput.value, seasons: seasonsInput.value })
  });

  form.reset();
  idInput.value = '';
  saveBtn.textContent = 'Додати';
  load();
};

search.oninput = load;
load();