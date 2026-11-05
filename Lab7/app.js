const express = require('express');
const seriesRoutes = require('./routes/series');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/api/series', seriesRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));