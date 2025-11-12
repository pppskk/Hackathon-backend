const { connect, sync } = require('./function/postgre');
const express = require('express');
// const 

const app = express();
const PORT = 3005;

app.post('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('Server is running 🌱');
});

require('./models/users');
require('./models/plants');
require('./models/plots');
require('./models/productionRounds');
require('./models/transactions');

app.listen(PORT, async () => {
  await connect();
  await sync();
  console.log(` Server running on port ${PORT}`);
});
