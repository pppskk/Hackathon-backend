const { connect, sync } = require('./function/postgre');
const session = require('express-session');
const express = require('express');


const app = express();
const PORT = 3005;

app.use(express.json());
app.use(session({
  secret: 'FC3XSZYnBW',
  resave: false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  res.send('Hello World!!!!');
});

// app.use('/api', require('./routes/app'));

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











