const { connect, sync } = require('./function/postgre');
const session = require('express-session');
const express = require('express');
const cors = require('cors');


const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'FC3XSZYnBW',
  resave: false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  res.send('Hello World!!!!');
});


app.use('/api', require('./routes'));


(async () => {
  try {
    await connect();
    console.log(' Start syncing database...');
    await sync({ force: true });
    console.log(' Database synced with FORCE mode!');
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error(' Failed to start server:', error);
  }
})();