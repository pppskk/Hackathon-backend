const { connect, sync } = require('./function/postgre');
const session = require('express-session');
const express = require('express');


const app = express();
const PORT = 3005;

// Middleware สำหรับ parse JSON body และ URL-encoded body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware สำหรับ debug request body
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('  Content-Type:', req.headers['content-type']);
    console.log('  Body:', JSON.stringify(req.body, null, 2));
    console.log('  Body type:', typeof req.body);
    console.log('  Body keys:', req.body ? Object.keys(req.body) : 'null');
  }
  next();
});

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