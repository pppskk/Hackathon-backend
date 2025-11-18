# 🧪 API Test Cases - ระบบจัดการแปลงเกษตร

## 📋 Test Environment

### Base URL
```
http://localhost:3005/api
```

### Tools
- cURL
- Postman
- Thunder Client (VS Code)
- Insomnia

---

## 🔄 Complete Test Flow

### Phase 1: User Management
```
TC001 - Register User A
TC002 - Register User B
TC003 - Login User A
TC004 - Check Authentication
TC005 - Logout
TC006 - Login Again
```

### Phase 2: Master Data
```
TC007 - Get Categories
TC008 - Create Plant
TC009 - Get All Plants
TC010 - Create Plot
TC011 - Get All Plots
```

### Phase 3: Production Round
```
TC012 - Create Round
TC013 - Get Rounds
```

### Phase 4: Transactions
```
TC014 - Create Expense Transaction
TC015 - Create Income Transaction
TC016 - Get All Transactions
```

### Phase 5: Dashboard
```
TC017 - Get Summary
TC018 - Get Plots Summary
```

### Phase 6: Security Tests
```
TC019 - User B tries to access User A's data (403)
TC020 - No login tries to access API (401)
TC021 - User A updates own data (200)
TC022 - User A tries to update User B's data (403)
```

---


## ✅ Test Cases Detail

### TC001: Register User A
```bash
curl -X POST http://localhost:3005/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678"
  }' \
  -c cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Response contains user_id, firstName, lastName, phone
- Cookie `sessionId` is set
- Session is created automatically

**Validation:**
- ✅ user_id is generated
- ✅ phone is unique
- ✅ session is created

---

### TC002: Register User B
```bash
curl -X POST http://localhost:3005/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "สมหญิง",
    "lastName": "รักดี",
    "phone": "0898765432"
  }' \
  -c cookies_userB.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Different user_id from User A
- Cookie is set for User B

---

### TC003: Login User A
```bash
curl -X POST http://localhost:3005/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0812345678"
  }' \
  -c cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Response contains user data
- New session is created (regenerated)

---

### TC004: Check Authentication
```bash
curl http://localhost:3005/api/users/check \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Response contains authenticated user data
- Session is valid

---

### TC005: Logout
```bash
curl -X POST http://localhost:3005/api/users/logout \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Session is destroyed
- Cookie is cleared

---

### TC006: Login Again
```bash
curl -X POST http://localhost:3005/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0812345678"
  }' \
  -c cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- New session is created
- Can access protected routes again

---

### TC007: Get Expense Categories
```bash
curl http://localhost:3005/api/categories/expense \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns 8 expense categories (id 1-8)
- Each category has: id, type_id=1, name, description

**Sample Response:**
```json
{
  "status": "success",
  "message": "Expense categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "type_id": 1,
      "name": "ค่าพันธุ์พืช",
      "description": "ค่าใช้จ่ายในการซื้อเมล็ดพันธุ์หรือต้นกล้า"
    },
    ...
  ]
}
```

---

### TC008: Create Plant (User A)
```bash
curl -X POST http://localhost:3005/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "plant_name": "ข้าวโพด"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Returns plant_id, user_id, plant_name
- plant_id is auto-generated

**Create More Plants:**
```bash
# ข้าวหอมมะลิ
curl -X POST http://localhost:3005/api/plants \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "plant_name": "ข้าวหอมมะลิ"}' \
  -b cookies_userA.txt

# มะเขือเทศ
curl -X POST http://localhost:3005/api/plants \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "plant_name": "มะเขือเทศ"}' \
  -b cookies_userA.txt
```

---

### TC009: Get All Plants (User A)
```bash
curl http://localhost:3005/api/plants?user_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns array of plants
- Only User A's plants (user_id=1)

---

### TC010: Create Plot (User A)
```bash
curl -X POST http://localhost:3005/api/plots \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "plant_id": 1,
    "plot_name": "แปลงหลังบ้าน",
    "area_size": 5.5
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Returns plot_id, user_id, plant_id, plot_name, area_size

**Create More Plots:**
```bash
# แปลงข้างเทศบาล
curl -X POST http://localhost:3005/api/plots \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "plant_id": 2,
    "plot_name": "แปลงข้างเทศบาล",
    "area_size": 12.0
  }' \
  -b cookies_userA.txt
```

---

### TC011: Get All Plots (User A)
```bash
curl http://localhost:3005/api/plots?user_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns array with plot info + plant_name (JOIN)
- Ordered by plot_id DESC

**Sample Response:**
```json
[
  {
    "plot_id": 2,
    "plot_name": "แปลงข้างเทศบาล",
    "area_size": 12,
    "plant_name": "ข้าวหอมมะลิ",
    "plant_id": 2
  },
  {
    "plot_id": 1,
    "plot_name": "แปลงหลังบ้าน",
    "area_size": 5.5,
    "plant_name": "ข้าวโพด",
    "plant_id": 1
  }
]
```

---

### TC012: Create Round (User A)
```bash
curl -X POST http://localhost:3005/api/rounds \
  -H "Content-Type: application/json" \
  -d '{
    "plot_id": 1,
    "user_id": 1,
    "round_name": "รอบที่ 1/2568",
    "start_date": "2025-01-15",
    "end_date": "2025-04-15"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Returns round with income_total=0, expense_total=0
- round_id is auto-generated

---

### TC013: Get Rounds (User A)
```bash
curl http://localhost:3005/api/rounds?plot_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns array of rounds for plot_id=1
- Only User A's rounds

---

### TC014: Create Expense Transaction (ค่าพันธุ์พืช)
```bash
curl -X POST http://localhost:3005/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "round_id": 1,
    "user_id": 1,
    "category_id": 1,
    "amount": 2000,
    "note": "ซื้อเมล็ดพันธุ์ข้าวโพด",
    "date": "2025-01-15"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- Returns transaction + totals
- expense_total = 2000
- income_total = 0

**Create More Expenses:**
```bash
# ค่าปุ๋ย
curl -X POST http://localhost:3005/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "round_id": 1,
    "user_id": 1,
    "category_id": 2,
    "amount": 5000,
    "note": "ซื้อปุ๋ย 15-15-15",
    "date": "2025-01-20"
  }' \
  -b cookies_userA.txt

# ค่าจ้างแรงงาน
curl -X POST http://localhost:3005/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "round_id": 1,
    "user_id": 1,
    "category_id": 4,
    "amount": 8000,
    "note": "ค่าจ้างคนงาน 4 คน",
    "date": "2025-01-16"
  }' \
  -b cookies_userA.txt
```

**After 3 expenses:**
- expense_total = 15000 (2000 + 5000 + 8000)
- income_total = 0

---

### TC015: Create Income Transaction (ขายผลผลิต)
```bash
curl -X POST http://localhost:3005/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "round_id": 1,
    "user_id": 1,
    "category_id": 9,
    "amount": 35000,
    "note": "ขายข้าวโพด 700 กก. @ 50 บาท/กก.",
    "date": "2025-04-15"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- expense_total = 15000
- income_total = 35000 ✅ (นับเป็นรายรับแล้ว!)
- profit = 20000

---

### TC016: Get All Transactions
```bash
curl http://localhost:3005/api/transactions?round_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns array of transactions with category info
- Ordered by date DESC
- Each transaction includes transaction_category object

**Sample Response:**
```json
[
  {
    "id": 4,
    "round_id": 1,
    "user_id": 1,
    "category_id": 9,
    "amount": 35000,
    "note": "ขายข้าวโพด 700 กก.",
    "date": "2025-04-15",
    "transaction_category": {
      "id": 9,
      "name": "ขายผลผลิต",
      "type_id": 2,
      "description": "รายได้จากการขายผลผลิตการเกษตร"
    }
  },
  {
    "id": 2,
    "round_id": 1,
    "user_id": 1,
    "category_id": 2,
    "amount": 5000,
    "note": "ซื้อปุ๋ย 15-15-15",
    "date": "2025-01-20",
    "transaction_category": {
      "id": 2,
      "name": "ค่าปุ๋ย",
      "type_id": 1,
      "description": "ค่าใช้จ่ายในการซื้อปุ๋ยเคมีหรือปุ๋ยอินทรีย์"
    }
  },
  ...
]
```

---

### TC017: Get Dashboard Summary
```bash
curl http://localhost:3005/api/dashboard/summary?user_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns summary of all rounds

**Sample Response:**
```json
{
  "income_total": "35000",
  "expense_total": "15000",
  "profit_total": "20000"
}
```

---

### TC018: Get Dashboard Plots Summary
```bash
curl http://localhost:3005/api/dashboard/plots?user_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Returns summary per plot

**Sample Response:**
```json
[
  {
    "plot_id": 2,
    "plot_name": "แปลงข้างเทศบาล",
    "plant_name": "ข้าวหอมมะลิ",
    "income_total": "0",
    "expense_total": "0",
    "profit": "0"
  },
  {
    "plot_id": 1,
    "plot_name": "แปลงหลังบ้าน",
    "plant_name": "ข้าวโพด",
    "income_total": "35000",
    "expense_total": "15000",
    "profit": "20000"
  }
]
```

---


## 🔒 Security Test Cases

### TC019: User B tries to access User A's plants (403)
```bash
curl http://localhost:3005/api/plants?user_id=1 \
  -b cookies_userB.txt \
  -v
```

**Expected Result:**
- Status: 403 Forbidden
- Error: "You can only access your own data"

**Validation:**
- ✅ User B (userId=2) cannot access User A's data (userId=1)
- ✅ checkUserOwnership middleware works

---

### TC020: No login tries to access API (401)
```bash
curl http://localhost:3005/api/plants?user_id=1 \
  -v
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Please login first"

**Validation:**
- ✅ requireAuth middleware works
- ✅ Cannot access protected routes without session

---

### TC021: User A updates own plant (200)
```bash
curl -X PUT http://localhost:3005/api/plants/1 \
  -H "Content-Type: application/json" \
  -d '{
    "plant_name": "ข้าวโพดหวาน"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 200 OK
- Plant is updated successfully
- Returns updated plant data

**Validation:**
- ✅ User can update own data
- ✅ Ownership check passes

---

### TC022: User B tries to update User A's plant (403)
```bash
curl -X PUT http://localhost:3005/api/plants/1 \
  -H "Content-Type: application/json" \
  -d '{
    "plant_name": "พืชปลอม"
  }' \
  -b cookies_userB.txt \
  -v
```

**Expected Result:**
- Status: 403 Forbidden
- Error: "You can only update your own plants"

**Validation:**
- ✅ User B cannot update User A's plant
- ✅ Ownership check in controller works

---

### TC023: User B tries to delete User A's plant (403)
```bash
curl -X DELETE http://localhost:3005/api/plants/1 \
  -b cookies_userB.txt \
  -v
```

**Expected Result:**
- Status: 403 Forbidden
- Error: "You can only delete your own plants"

---

### TC024: User A tries to access User B's transactions (403)
```bash
# Assume User B has round_id=2
curl http://localhost:3005/api/transactions?round_id=2 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 403 Forbidden
- Error: "You can only access your own transactions"

**Validation:**
- ✅ Controller checks round ownership
- ✅ User A cannot access User B's transactions

---

### TC025: Logout and try to access protected route (401)
```bash
# Logout
curl -X POST http://localhost:3005/api/users/logout \
  -b cookies_userA.txt

# Try to access
curl http://localhost:3005/api/plants?user_id=1 \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Please login first"

**Validation:**
- ✅ Session is destroyed after logout
- ✅ Cannot access protected routes after logout

---

## 🧪 Edge Cases

### TC026: Register with duplicate phone (400)
```bash
curl -X POST http://localhost:3005/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "คนที่สาม",
    "lastName": "ทดสอบ",
    "phone": "0812345678"
  }' \
  -v
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Phone number already registered"

---

### TC027: Register with invalid phone format (400)
```bash
curl -X POST http://localhost:3005/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "ทดสอบ",
    "lastName": "เบอร์ผิด",
    "phone": "1234567890"
  }' \
  -v
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Invalid phone number format"

**Valid formats:**
- 06xxxxxxxx
- 07xxxxxxxx
- 08xxxxxxxx
- 09xxxxxxxx

---

### TC028: Create transaction without round_id but with plot_id
```bash
curl -X POST http://localhost:3005/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "plot_id": 2,
    "user_id": 1,
    "category_id": 2,
    "amount": 3000,
    "note": "ทดสอบสร้างรอบอัตโนมัติ",
    "date": "2025-01-20"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 201 Created
- System finds existing round OR creates new round automatically
- Returns round_id in response

**Validation:**
- ✅ Auto-create round feature works
- ✅ If no round exists for plot_id=2, creates "รอบการปลูกครั้งแรก"

---

### TC029: Create round with invalid dates (400)
```bash
curl -X POST http://localhost:3005/api/rounds \
  -H "Content-Type: application/json" \
  -d '{
    "plot_id": 1,
    "user_id": 1,
    "round_name": "รอบผิด",
    "start_date": "2025-05-01",
    "end_date": "2025-01-01"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "start_date must be before end_date"

---

### TC030: Update user with duplicate phone (400)
```bash
# User A tries to change phone to User B's phone
curl -X PUT http://localhost:3005/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0898765432"
  }' \
  -b cookies_userA.txt \
  -v
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Phone number already exists"

---

## 📊 Test Summary Template

### Test Execution Report

| TC# | Test Case | Status | Notes |
|-----|-----------|--------|-------|
| TC001 | Register User A | ✅ PASS | |
| TC002 | Register User B | ✅ PASS | |
| TC003 | Login User A | ✅ PASS | |
| TC004 | Check Auth | ✅ PASS | |
| TC005 | Logout | ✅ PASS | |
| TC006 | Login Again | ✅ PASS | |
| TC007 | Get Categories | ✅ PASS | |
| TC008 | Create Plant | ✅ PASS | |
| TC009 | Get Plants | ✅ PASS | |
| TC010 | Create Plot | ✅ PASS | |
| TC011 | Get Plots | ✅ PASS | |
| TC012 | Create Round | ✅ PASS | |
| TC013 | Get Rounds | ✅ PASS | |
| TC014 | Create Expense | ✅ PASS | |
| TC015 | Create Income | ✅ PASS | |
| TC016 | Get Transactions | ✅ PASS | |
| TC017 | Get Summary | ✅ PASS | |
| TC018 | Get Plots Summary | ✅ PASS | |
| TC019 | Security: 403 | ✅ PASS | |
| TC020 | Security: 401 | ✅ PASS | |
| TC021 | Update Own Data | ✅ PASS | |
| TC022 | Update Others: 403 | ✅ PASS | |
| TC023 | Delete Others: 403 | ✅ PASS | |
| TC024 | Access Others: 403 | ✅ PASS | |
| TC025 | After Logout: 401 | ✅ PASS | |
| TC026 | Duplicate Phone | ✅ PASS | |
| TC027 | Invalid Phone | ✅ PASS | |
| TC028 | Auto-create Round | ✅ PASS | |
| TC029 | Invalid Dates | ✅ PASS | |
| TC030 | Duplicate Phone Update | ✅ PASS | |

---

## 🎯 Quick Test Script

### Complete Flow Test (Bash)
```bash
#!/bin/bash

BASE_URL="http://localhost:3005/api"

echo "=== TC001: Register User A ==="
curl -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"สมชาย","lastName":"ใจดี","phone":"0812345678"}' \
  -c cookies_userA.txt

echo "\n=== TC008: Create Plant ==="
curl -X POST $BASE_URL/plants \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"plant_name":"ข้าวโพด"}' \
  -b cookies_userA.txt

echo "\n=== TC010: Create Plot ==="
curl -X POST $BASE_URL/plots \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"plant_id":1,"plot_name":"แปลงหลังบ้าน","area_size":5.5}' \
  -b cookies_userA.txt

echo "\n=== TC012: Create Round ==="
curl -X POST $BASE_URL/rounds \
  -H "Content-Type: application/json" \
  -d '{"plot_id":1,"user_id":1,"round_name":"รอบที่ 1/2568","start_date":"2025-01-15","end_date":"2025-04-15"}' \
  -b cookies_userA.txt

echo "\n=== TC014: Create Expense ==="
curl -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -d '{"round_id":1,"user_id":1,"category_id":2,"amount":5000,"note":"ซื้อปุ๋ย","date":"2025-01-20"}' \
  -b cookies_userA.txt

echo "\n=== TC015: Create Income ==="
curl -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -d '{"round_id":1,"user_id":1,"category_id":9,"amount":35000,"note":"ขายผลผลิต","date":"2025-04-15"}' \
  -b cookies_userA.txt

echo "\n=== TC017: Get Summary ==="
curl $BASE_URL/dashboard/summary?user_id=1 \
  -b cookies_userA.txt

echo "\n\n=== All Tests Completed ==="
```

---

## 📝 Notes

### Before Testing
1. Start server: `npm start`
2. Wait for categories to be created (check console)
3. Database should be empty (or use `force: true` in sync)

### During Testing
1. Save cookies for each user separately
2. Check response status codes
3. Verify response data structure
4. Check database if needed

### After Testing
1. Review test results
2. Document any failures
3. Check server logs for errors
4. Clean up test data if needed

---

**Test Cases Version: 1.0**  
**Last Updated: 2025-01-17**
