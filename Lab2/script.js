
const apiUrl = "https://randomuser.me/api/";


const result = document.getElementById("result");
const status = document.getElementById("status");

const btnFetch = document.getElementById("btnFetch");
const btnAxios = document.getElementById("btnAxios");
const btnRefresh = document.getElementById("btnRefresh");



async function getUserWithFetch() {

    try {

        status.textContent = "Завантаження користувача...";
        result.innerHTML = "";

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Помилка HTTP: " + response.status);
        }

        const data = await response.json();

        const user = data.results[0];

        showUsers([user]);

        status.textContent = "Користувача отримано за допомогою Fetch";

    } catch (error) {

        console.error("Помилка Fetch:", error);

        status.textContent = "";

        result.innerHTML = `
            <div class="error">
                Не вдалося отримати дані через Fetch.
            </div>
        `;
    }
}



async function getUsersWithAxios() {

    try {

        status.textContent = "Завантаження 10 користувачів...";
        result.innerHTML = "";

        const response = await axios.get(apiUrl + "?results=10");

        const users = response.data.results;

        showUsers(users);

        status.textContent = "10 користувачів отримано за допомогою Axios";

    } catch (error) {

        console.error("Помилка Axios:", error);

        status.textContent = "";

        result.innerHTML = `
            <div class="error">
                Не вдалося отримати дані через Axios.
            </div>
        `;
    }
}



function showUsers(users) {

    result.innerHTML = "";

    users.forEach(user => {

        const fullName =
            `${user.name.first} ${user.name.last}`;

        const location =
            `${user.location.city}, ${user.location.country}`;

        const card = document.createElement("div");

        card.className = "user-card";

        card.innerHTML = `
            <img 
                src="${user.picture.large}" 
                alt="${fullName}"
            >

            <h2>${fullName}</h2>

            <p>
                <strong>Email:</strong>
                ${user.email}
            </p>

            <p>
                <strong>Телефон:</strong>
                ${user.phone}
            </p>

            <p>
                <strong>Місто:</strong>
                ${location}
            </p>

            <p>
                <strong>Вік:</strong>
                ${user.dob.age}
            </p>
        `;

        result.appendChild(card);
    });
}



btnFetch.addEventListener("click", getUserWithFetch);

btnAxios.addEventListener("click", getUsersWithAxios);



btnRefresh.addEventListener("click", () => {

    getUsersWithAxios();

});




getUsersWithAxios();

