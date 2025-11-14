// ทดสอบ API ด้วย fetch API (ถ้า Node.js รองรับ)
const http = require('http');

async function testAPI(method, path, data = null) {
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
        'Accept': 'application/json'
      }
    };

    if (jsonData) {
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
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
          rawBody: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (jsonData) {
      console.log(`Sending ${method} ${path}:`, jsonData);
      req.write(jsonData);
    }

    req.end();
  });
}

async function runTests() {
  console.log('=== เริ่มทดสอบ API (Fetch Style) ===\n');

  // Test 1: Login
  console.log('1. ทดสอบ POST /api/users/login (เบอร์: 0899998989)');
  try {
    const result = await testAPI('POST', '/api/users/login', { phone: '0899998989' });
    console.log('Status:', result.statusCode);
    console.log('Response:', JSON.stringify(result.body, null, 2));
    if (result.body && result.body.received) {
      console.log('Received from server:', result.body.received);
    }
    if (result.body && result.body.debug) {
      console.log('Debug info:', result.body.debug);
    }
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
  }

  console.log('=== สิ้นสุดการทดสอบ ===');
}

runTests().catch(console.error);

