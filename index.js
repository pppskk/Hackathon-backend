const { connect, sync } = require('./function/postgre');
const session = require('express-session');
const express = require('express');
const cors = require('cors');


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

app.use(cors());

// Session configuration with better security
app.use(session({
  secret: process.env.SESSION_SECRET || 'FC3XSZYnBW',
  resave: false,
  saveUninitialized: false, // เปลี่ยนเป็น false เพื่อไม่สร้าง session ที่ไม่จำเป็น
  cookie: {
    secure: process.env.NODE_ENV === 'production', // ใช้ secure cookie ใน production
    httpOnly: true, // ป้องกัน XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 ชั่วโมง
    sameSite: 'lax' // ป้องกัน CSRF
  },
  name: 'sessionId', // เปลี่ยนชื่อ cookie เพื่อความปลอดภัย
  rolling: true // รีเซ็ต expiration ทุกครั้งที่มี request
}));


app.get('/', (req, res) => {
  res.send('Hello World!!!!');
});


app.use('/api', require('./routes'));


(async () => {
  try {
    await connect();
    console.log('🔄 Start syncing database...');
    await sync({ force: true });
    console.log('✅ Database synced with FORCE mode!');

    // สร้างข้อมูล categories อัตโนมัติ
    const { seedCategories } = require('./function/seedCategories');
    await seedCategories();

    app.listen(PORT, () =>
      console.log(`\n🚀 Server running on http://localhost:${PORT}\n`)
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
})();