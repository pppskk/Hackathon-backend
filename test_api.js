const http = require('http');

// เก็บ cookies สำหรับ session
let cookieJar = '';

// ฟังก์ชันสำหรับทดสอบ API
function testAPI(method, path, data = null, useCookies = true) {
  return new Promise((resolve, reject) => {
    let jsonData = null;
    if (data) {
      jsonData = JSON.stringify(data);
    }

    const options = {
      hostname: 'localhost',
      port: 3005,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (jsonData) {
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    if (useCookies && cookieJar) {
      options.headers['Cookie'] = cookieJar;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        // อัพเดท cookie jar
        if (cookies) {
          cookieJar = cookies.map(c => c.split(';')[0]).join('; ');
        }
        let parsedBody = responseData;
        try {
          parsedBody = JSON.parse(responseData);
        } catch (e) {
          // ไม่ใช่ JSON
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          rawBody: responseData,
          cookies: cookies
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (jsonData) {
      console.log('Sending data:', jsonData);
      req.write(jsonData);
    }

    req.end();
  });
}

async function runTests() {
  console.log('=== เริ่มทดสอบ API ===\n');
  
  // Reset cookie jar
  cookieJar = '';

  // Test 0: ตรวจสอบว่าเซิร์ฟเวอร์ทำงาน
  console.log('0. ทดสอบ GET / (ตรวจสอบว่าเซิร์ฟเวอร์ทำงาน)');
  try {
    const result0 = await testAPI('GET', '/', null, false);
    console.log('Status:', result0.statusCode);
    console.log('Response:', result0.body);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('เซิร์ฟเวอร์อาจไม่รันอยู่!');
    console.log('');
    return;
  }

  // Test 1: ตรวจสอบว่าเซิร์ฟเวอร์ทำงาน
  console.log('1. ทดสอบ GET /api/users/check (ควรได้ 401 - ยังไม่ login)');
  try {
    const result1 = await testAPI('GET', '/api/users/check', null, false);
    console.log('Status:', result1.statusCode);
    console.log('Response:', result1.body);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  // Test 2: Login ด้วยเบอร์ 0899998989
  console.log('2. ทดสอบ POST /api/users/login (เบอร์: 0899998989)');
  try {
    const result2 = await testAPI('POST', '/api/users/login', { phone: '0899998989' });
    console.log('Status:', result2.statusCode);
    console.log('Response:', JSON.stringify(result2.body, null, 2));
    if (result2.body && result2.body.received) {
      console.log('Received data from server:', result2.body.received);
    }
    console.log('Cookie jar:', cookieJar);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  // Test 3: ตรวจสอบ session หลัง login
  console.log('3. ทดสอบ GET /api/users/check (หลัง login)');
  try {
    const result3 = await testAPI('GET', '/api/users/check');
    console.log('Status:', result3.statusCode);
    console.log('Response:', result3.body);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  // Test 4: Login ด้วยเบอร์ 0812345679
  console.log('4. ทดสอบ POST /api/users/login (เบอร์: 0812345679)');
  try {
    const result4 = await testAPI('POST', '/api/users/login', { phone: '0812345679' });
    console.log('Status:', result4.statusCode);
    console.log('Response:', result4.body);
    console.log('Cookie jar:', cookieJar);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  // Test 5: ตรวจสอบ session หลัง login เบอร์ที่ 2
  console.log('5. ทดสอบ GET /api/users/check (หลัง login เบอร์ที่ 2)');
  try {
    const result5 = await testAPI('GET', '/api/users/check');
    console.log('Status:', result5.statusCode);
    console.log('Response:', result5.body);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  console.log('=== สิ้นสุดการทดสอบ ===');
}

runTests().catch(console.error);

