const ctx = document.getElementById('myChart');

new Chart(ctx, {
    type: 'line',

    data: {
        labels: [
            'Понеділок',
            'Вівторок',
            'Середа',
            'Четвер',
            'П’ятниця',
            'Субота',
            'Неділя'
        ],

        datasets: [{
            label: 'Температура повітря, °C — S.D',

            data: [20, 22, 19, 23, 25, 24, 21],

            borderColor: 'blue',

            backgroundColor: 'rgba(0, 0, 255, 0.2)',

            borderWidth: 3,

            fill: true,

            tension: 0.3,

            pointBackgroundColor: 'red',

            pointRadius: 5
        }]
    },

    options: {
        responsive: true,

        plugins: {
            title: {
                display: true,

                text: 'Температура повітря у Львові протягом тижня'
            }
        },

        scales: {
            y: {
                beginAtZero: true,

                title: {
                    display: true,

                    text: 'Температура, °C'
                }
            },

            x: {
                title: {
                    display: true,

                    text: 'Дні тижня'
                }
            }
        }
    }
});