# 📚 API Complete Documentation - ระบบจัดการแปลงเกษตร

## 🌐 Base URL
```
http://localhost:3005/api
```

## 🔐 Authentication
ระบบใช้ **Session-based Authentication** โดย:
- Cookie name: `sessionId`
- Session timeout: 24 ชั่วโมง
- ต้องส่ง cookie ทุกครั้งที่ request (credentials: 'include')

---

## 📊 Database Schema

### Users
```javascript
{
  user_id: INTEGER (PK, Auto),
  firstName: STRING,
  lastName: STRING,
  phone: STRING (Unique, 10 digits, 06-09),
  userPicture: STRING
}
```

### Plants
```javascript
{
  plant_id: INTEGER (PK, Auto),
  user_id: INTEGER (FK → users),
  plant_name: STRING (required)
}
```

### Plots
```javascript
{
  plot_id: INTEGER (PK, Auto),
  plant_id: INTEGER (FK → plants),
  user_id: INTEGER (FK → users),
  plot_name: STRING (required),
  area_size: FLOAT
}
```

### Production Rounds
```javascript
{
  round_id: INTEGER (PK, Auto),
  plot_id: INTEGER (FK → plots),
  user_id: INTEGER (FK → users),
  round_name: STRING,
  start_date: DATE,
  end_date: DATE,
  income_total: FLOAT (default: 0),
  expense_total: FLOAT (default: 0),
  profit_total: VIRTUAL (income - expense)
}
```

### Transaction Types
```javascript
{
  id: INTEGER (PK, Auto),
  name: STRING (expense/income),
  description: STRING
}
```

### Transaction Categories
```javascript
{
  id: INTEGER (PK, Auto),
  type_id: INTEGER (FK → transaction_types),
  name: STRING (required),
  description: STRING
}
```

### Transactions
```javascript
{
  id: INTEGER (PK, Auto),
  round_id: INTEGER (FK → production_rounds),
  user_id: INTEGER (FK → users),
  category_id: INTEGER (FK → transaction_categories),
  amount: FLOAT (required),
  note: TEXT,
  date: DATE (default: today)
}
```

---

## 🗂️ Categories (Auto-created)

### Transaction Types
| id | name | description |
|----|------|-------------|
| 1 | expense | รายจ่าย |
| 2 | income | รายรับ |

### Expense Categories (type_id = 1)
| id | name | description |
|----|------|-------------|
| 1 | ค่าพันธุ์พืช | ค่าใช้จ่ายในการซื้อเมล็ดพันธุ์หรือต้นกล้า |
| 2 | ค่าปุ๋ย | ค่าใช้จ่ายในการซื้อปุ๋ยเคมีหรือปุ๋ยอินทรีย์ |
| 3 | ค่ายาฆ่าแมลง | ค่าใช้จ่ายในการซื้อยาปราบศัตรูพืช |
| 4 | ค่าจ้างแรงงาน | ค่าจ้างคนงานในการปลูก ดูแล หรือเก็บเกี่ยว |
| 5 | ค่าเครื่องจักร | ค่าเช่าหรือค่าน้ำมันเครื่องจักรการเกษตร |
| 6 | ค่าน้ำ | ค่าใช้จ่ายในการจัดหาน้ำสำหรับรดพืช |
| 7 | ค่าไฟฟ้า | ค่าไฟฟ้าสำหรับปั๊มน้ำหรืออุปกรณ์ |
| 8 | อื่นๆ | ค่าใช้จ่ายอื่นๆ |

### Income Categories (type_id = 2)
| id | name | description |
|----|------|-------------|
| 9 | ขายผลผลิต | รายได้จากการขายผลผลิตการเกษตร |
| 10 | เงินอุดหนุน | เงินอุดหนุนจากภาครัฐหรือองค์กร |
| 11 | อื่นๆ | รายรับอื่นๆ |

---


## 1️⃣ USER API

### 1.1 Register (สมัครสมาชิก)
```http
POST /api/users/register
Content-Type: application/json

Request Body:
{
  "firstName": "สมชาย",      // optional
  "lastName": "ใจดี",         // optional
  "phone": "0812345678",      // required, unique
  "userPicture": "url"        // optional
}

Response 201:
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "userPicture": null
  }
}

Errors:
400 - Phone number is required
400 - Invalid phone number format
400 - Phone number already registered
500 - Internal server error
```

**หมายเหตุ:** Register สำเร็จจะสร้าง session อัตโนมัติ (login ทันที)

---

### 1.2 Login (เข้าสู่ระบบ)
```http
POST /api/users/login
Content-Type: application/json

Request Body:
{
  "phone": "0812345678"       // รองรับ phone_number ด้วย
}

Response 200:
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user_id": 1,
    "phone": "0812345678",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "userPicture": null
  }
}

Errors:
400 - Phone number is required
400 - Invalid phone number format
404 - User not found. Please register first.
500 - Internal server error
```

---

### 1.3 Check Authentication
```http
GET /api/users/check
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Authenticated",
  "data": {
    "user_id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "userPicture": null
  }
}

Errors:
401 - Not authenticated
401 - User not found
500 - Internal server error
```

---

### 1.4 Logout
```http
POST /api/users/logout
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Logout successful"
}

Errors:
401 - Unauthorized - Please login first
500 - Failed to logout
```

---

### 1.5 Get User Profile
```http
GET /api/users/:id
Authorization: Required (Session + Ownership)

Response 200:
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user_id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "userPicture": null
  }
}

Errors:
401 - Unauthorized - Please login first
403 - Forbidden - You can only access your own profile
404 - User not found
500 - Internal server error
```

---

### 1.6 Update User Profile
```http
PUT /api/users/:id
Authorization: Required (Session + Ownership)
Content-Type: application/json

Request Body:
{
  "firstName": "สมชาย",
  "lastName": "รักดี",
  "phone": "0898765432",
  "userPicture": "new-url"
}

Response 200:
{
  "status": "success",
  "message": "User profile updated successfully",
  "data": {
    "user_id": 1,
    "firstName": "สมชาย",
    "lastName": "รักดี",
    "phone": "0898765432",
    "userPicture": "new-url"
  }
}

Errors:
400 - At least one field is required to update
400 - Invalid phone number format
400 - Phone number already exists
401 - Unauthorized
403 - Forbidden - You can only update your own profile
404 - User not found
500 - Internal server error
```

---

### 1.7 Delete User Account
```http
DELETE /api/users/:id
Authorization: Required (Session + Ownership)

Response 200:
{
  "status": "success",
  "message": "User account deleted successfully"
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only delete your own account
404 - User not found
500 - Internal server error
```

---

## 2️⃣ PLANT API (ชนิดพืช)

### 2.1 Get All Plants
```http
GET /api/plants?user_id=1
Authorization: Required (Session + Ownership)

Response 200:
[
  {
    "plant_id": 1,
    "user_id": 1,
    "plant_name": "ข้าวโพด"
  },
  {
    "plant_id": 2,
    "user_id": 1,
    "plant_name": "ข้าวหอมมะลิ"
  }
]

Errors:
400 - user_id is required
401 - Unauthorized - Please login first
403 - Forbidden - You can only access your own data
500 - Internal server error
```

---

### 2.2 Get Plant by ID
```http
GET /api/plants/:id
Authorization: Required (Session)

Response 200:
{
  "plant_id": 1,
  "user_id": 1,
  "plant_name": "ข้าวโพด"
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only access your own plants
404 - Plant not found
500 - Internal server error
```

---

### 2.3 Create Plant
```http
POST /api/plants
Authorization: Required (Session + Ownership)
Content-Type: application/json

Request Body:
{
  "user_id": 1,
  "plant_name": "มะเขือเทศ"
}

Response 201:
{
  "plant_id": 3,
  "user_id": 1,
  "plant_name": "มะเขือเทศ"
}

Errors:
400 - Missing required fields
401 - Unauthorized
403 - Forbidden - You can only access your own data
500 - Internal server error
```

---

### 2.4 Update Plant
```http
PUT /api/plants/:id
Authorization: Required (Session)
Content-Type: application/json

Request Body:
{
  "plant_name": "มะเขือเทศราชินี"
}

Response 200:
{
  "plant_id": 3,
  "user_id": 1,
  "plant_name": "มะเขือเทศราชินี"
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only update your own plants
404 - Plant not found
500 - Internal server error
```

---

### 2.5 Delete Plant
```http
DELETE /api/plants/:id
Authorization: Required (Session)

Response 200:
{
  "message": "Plant deleted successfully"
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only delete your own plants
404 - Plant not found
500 - Internal server error
```

---

## 3️⃣ PLOT API (แปลงเกษตร)

### 3.1 Get All Plots
```http
GET /api/plots?user_id=1
Authorization: Required (Session + Ownership)

Response 200:
[
  {
    "plot_id": 1,
    "plot_name": "แปลงหลังบ้าน",
    "area_size": 5.5,
    "plant_name": "ข้าวโพด",
    "plant_id": 1
  },
  {
    "plot_id": 2,
    "plot_name": "แปลงข้างเทศบาล",
    "area_size": 12,
    "plant_name": "ข้าวหอมมะลิ",
    "plant_id": 2
  }
]

Errors:
400 - user_id is required
401 - Unauthorized
403 - Forbidden - You can only access your own data
500 - Internal server error
```

---

### 3.2 Create Plot
```http
POST /api/plots
Authorization: Required (Session + Ownership)
Content-Type: application/json

Request Body:
{
  "user_id": 1,
  "plant_id": 1,
  "plot_name": "แปลงใหม่ริมคลอง",
  "area_size": 8.5
}

Response 201:
{
  "plot_id": 3,
  "user_id": 1,
  "plant_id": 1,
  "plot_name": "แปลงใหม่ริมคลอง",
  "area_size": 8.5
}

Errors:
400 - Missing required fields: user_id, plant_id, plot_name
401 - Unauthorized
403 - Forbidden
500 - Internal server error
```

---

### 3.3 Update Plot
```http
PUT /api/plots/:id
Authorization: Required (Session)
Content-Type: application/json

Request Body:
{
  "plot_name": "แปลงริมคลองใหญ่",
  "area_size": 10.0,
  "plant_id": 2
}

Response 200:
{
  "plot_id": 3,
  "user_id": 1,
  "plant_id": 2,
  "plot_name": "แปลงริมคลองใหญ่",
  "area_size": 10
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only update your own plots
404 - Plot not found
500 - Internal server error
```

---

### 3.4 Delete Plot
```http
DELETE /api/plots/:id
Authorization: Required (Session)

Response 200:
{
  "message": "Plot deleted"
}

Errors:
401 - Unauthorized
403 - Forbidden - You can only delete your own plots
404 - Plot not found
500 - Internal server error
```

---


## 4️⃣ ROUND API (รอบการผลิต)

### 4.1 Get Rounds by Plot
```http
GET /api/rounds?plot_id=1
Authorization: Required (Session)

Response 200:
[
  {
    "round_id": 1,
    "plot_id": 1,
    "user_id": 1,
    "round_name": "รอบที่ 1/2568",
    "start_date": "2025-01-15",
    "end_date": "2025-04-15",
    "yield_unit": null,
    "income_total": 35000,
    "expense_total": 15000
  }
]

Errors:
400 - plot_id is required
401 - Unauthorized
403 - Forbidden - You can only access your own rounds
404 - Plot not found
500 - Failed to retrieve rounds
```

---

### 4.2 Create Round
```http
POST /api/rounds
Authorization: Required (Session + Ownership)
Content-Type: application/json

Request Body:
{
  "plot_id": 1,
  "user_id": 1,
  "round_name": "รอบที่ 2/2568",
  "start_date": "2025-05-01",
  "end_date": "2025-08-01"      // optional
}

Response 201:
{
  "round_id": 2,
  "plot_id": 1,
  "user_id": 1,
  "round_name": "รอบที่ 2/2568",
  "start_date": "2025-05-01",
  "end_date": "2025-08-01",
  "yield_unit": null,
  "income_total": 0,
  "expense_total": 0
}

Errors:
400 - Missing required fields: plot_id, user_id, round_name, start_date
400 - start_date must be before end_date
401 - Unauthorized
403 - Forbidden
500 - Failed to create round
```

---

## 5️⃣ TRANSACTION API (รายรับ-รายจ่าย)

### 5.1 Get Transactions by Round
```http
GET /api/transactions?round_id=1
Authorization: Required (Session)

Response 200:
[
  {
    "id": 2,
    "round_id": 1,
    "user_id": 1,
    "category_id": 9,
    "amount": 35000,
    "note": "ขายผลผลิต",
    "date": "2025-04-15",
    "transaction_category": {
      "id": 9,
      "name": "ขายผลผลิต",
      "type_id": 2,
      "description": "รายได้จากการขายผลผลิตการเกษตร"
    }
  },
  {
    "id": 1,
    "round_id": 1,
    "user_id": 1,
    "category_id": 2,
    "amount": 5000,
    "note": "ซื้อปุ๋ย",
    "date": "2025-01-20",
    "transaction_category": {
      "id": 2,
      "name": "ค่าปุ๋ย",
      "type_id": 1,
      "description": "ค่าใช้จ่ายในการซื้อปุ๋ยเคมีหรือปุ๋ยอินทรีย์"
    }
  }
]

Errors:
400 - round_id is required
401 - Unauthorized
403 - Forbidden - You can only access your own transactions
404 - Round not found
500 - Internal server error
```

---

### 5.2 Create Transaction
```http
POST /api/transactions
Authorization: Required (Session + Ownership)
Content-Type: application/json

Request Body (แบบที่ 1 - มี round_id):
{
  "round_id": 1,
  "user_id": 1,
  "category_id": 2,
  "amount": 5000,
  "note": "ซื้อปุ๋ย 15-15-15",
  "date": "2025-01-20"
}

Request Body (แบบที่ 2 - ไม่มี round_id, ระบบสร้างให้):
{
  "plot_id": 1,              // ใช้แทน round_id
  "user_id": 1,
  "category_id": 2,
  "amount": 5000,
  "note": "ซื้อปุ๋ย",
  "date": "2025-01-20"
}

Response 201:
{
  "message": "Transaction created successfully",
  "round_id": 1,
  "totals": {
    "income_total": "35000",
    "expense_total": "5000"
  },
  "transaction": {
    "id": 1,
    "round_id": 1,
    "user_id": 1,
    "category_id": 2,
    "amount": 5000,
    "note": "ซื้อปุ๋ย 15-15-15",
    "date": "2025-01-20"
  }
}

Errors:
400 - Missing round_id
401 - Unauthorized
403 - Forbidden - You can only access your own data
500 - Internal server error
```

**หมายเหตุ:**
- ถ้าไม่มี `round_id` แต่มี `plot_id` → ระบบจะหา round ของ plot นั้น หรือสร้างรอบใหม่อัตโนมัติ
- ระบบจะคำนวณ `income_total` และ `expense_total` อัตโนมัติตาม `type_id` ของ category
- `category_id = 1-8` → รายจ่าย (expense)
- `category_id = 9-11` → รายรับ (income)

---

## 6️⃣ CATEGORY API (หมวดหมู่)

### 6.1 Get Transaction Types
```http
GET /api/categories/types
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Transaction types retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "expense",
      "description": "รายจ่าย"
    },
    {
      "id": 2,
      "name": "income",
      "description": "รายรับ"
    }
  ]
}

Errors:
401 - Unauthorized
500 - Internal server error
```

---

### 6.2 Get All Categories
```http
GET /api/categories
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Transaction categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "type_id": 1,
      "name": "ค่าพันธุ์พืช",
      "description": "ค่าใช้จ่ายในการซื้อเมล็ดพันธุ์หรือต้นกล้า",
      "transaction_type": {
        "id": 1,
        "name": "expense",
        "description": "รายจ่าย"
      }
    },
    ...
  ]
}

Errors:
401 - Unauthorized
500 - Internal server error
```

---

### 6.3 Get Categories by Type
```http
GET /api/categories?type_id=1
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Transaction categories retrieved successfully",
  "data": [
    // เฉพาะ categories ที่ type_id = 1 (รายจ่าย)
  ]
}
```

---

### 6.4 Get Expense Categories
```http
GET /api/categories/expense
Authorization: Required (Session)

Response 200:
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
    {
      "id": 2,
      "type_id": 1,
      "name": "ค่าปุ๋ย",
      "description": "ค่าใช้จ่ายในการซื้อปุ๋ยเคมีหรือปุ๋ยอินทรีย์"
    },
    ...
  ]
}

Errors:
401 - Unauthorized
500 - Internal server error
```

---

### 6.5 Get Income Categories
```http
GET /api/categories/income
Authorization: Required (Session)

Response 200:
{
  "status": "success",
  "message": "Income categories retrieved successfully",
  "data": [
    {
      "id": 9,
      "type_id": 2,
      "name": "ขายผลผลิต",
      "description": "รายได้จากการขายผลผลิตการเกษตร"
    },
    {
      "id": 10,
      "type_id": 2,
      "name": "เงินอุดหนุน",
      "description": "เงินอุดหนุนจากภาครัฐหรือองค์กร"
    },
    {
      "id": 11,
      "type_id": 2,
      "name": "อื่นๆ",
      "description": "รายรับอื่นๆ"
    }
  ]
}

Errors:
401 - Unauthorized
500 - Internal server error
```

---

## 7️⃣ DASHBOARD API (สรุปข้อมูล)

### 7.1 Get Summary
```http
GET /api/dashboard/summary?user_id=1
Authorization: Required (Session + Ownership)

Response 200:
{
  "income_total": "150000",
  "expense_total": "95000",
  "profit_total": "55000"
}

Errors:
400 - user_id is required
401 - Unauthorized
403 - Forbidden - You can only access your own data
500 - Internal server error
```

**หมายเหตุ:** สรุปรายรับ-รายจ่าย-กำไร จากทุกรอบการผลิตของ user

---

### 7.2 Get Plots Summary
```http
GET /api/dashboard/plots?user_id=1
Authorization: Required (Session + Ownership)

Response 200:
[
  {
    "plot_id": 2,
    "plot_name": "แปลงข้างเทศบาล",
    "plant_name": "ข้าวหอมมะลิ",
    "income_total": "70000",
    "expense_total": "45000",
    "profit": "25000"
  },
  {
    "plot_id": 1,
    "plot_name": "แปลงหลังบ้าน",
    "plant_name": "ข้าวโพด",
    "income_total": "80000",
    "expense_total": "50000",
    "profit": "30000"
  }
]

Errors:
400 - user_id is required
401 - Unauthorized
403 - Forbidden - You can only access your own data
500 - Internal server error
```

**หมายเหตุ:** สรุปรายรับ-รายจ่าย-กำไร แยกตามแปลง (รวมทุกรอบการผลิต)

---

## 🔄 API Flow (การทำงานทั่วไป)

### Flow 1: เริ่มต้นใช้งาน
```
1. POST /api/users/register → สร้าง user (ได้ session)
2. GET /api/categories/expense → ดู categories รายจ่าย
3. GET /api/categories/income → ดู categories รายรับ
```

### Flow 2: สร้างข้อมูลพื้นฐาน
```
4. POST /api/plants → สร้างชนิดพืช (เช่น "ข้าวโพด")
5. POST /api/plots → สร้างแปลง (เลือกพืชที่สร้างไว้)
6. POST /api/rounds → สร้างรอบการผลิต (เลือกแปลงที่สร้างไว้)
```

### Flow 3: บันทึกรายรับ-รายจ่าย
```
7. POST /api/transactions → บันทึกรายจ่าย (category_id = 1-8)
8. POST /api/transactions → บันทึกรายรับ (category_id = 9-11)
9. GET /api/transactions?round_id=1 → ดูรายการทั้งหมด
```

### Flow 4: ดูสรุปข้อมูล
```
10. GET /api/dashboard/summary?user_id=1 → ดูภาพรวมทั้งหมด
11. GET /api/dashboard/plots?user_id=1 → ดูสรุปแต่ละแปลง
```

---

## 🔒 Authorization Rules

### Public (ไม่ต้อง login)
- POST /api/users/register
- POST /api/users/login

### Protected (ต้อง login)
- POST /api/users/logout
- GET /api/users/check
- GET /api/categories/*

### Protected + Ownership (ต้อง login และเป็นเจ้าของ)
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/plants?user_id=X
- POST /api/plants
- PUT /api/plants/:id
- DELETE /api/plants/:id
- GET /api/plots?user_id=X
- POST /api/plots
- PUT /api/plots/:id
- DELETE /api/plots/:id
- GET /api/rounds?plot_id=X
- POST /api/rounds
- GET /api/transactions?round_id=X
- POST /api/transactions
- GET /api/dashboard/summary?user_id=X
- GET /api/dashboard/plots?user_id=X

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## 📝 Notes

### Session Management
- Session จะถูกสร้างเมื่อ register หรือ login
- Session จะหมดอายุใน 24 ชั่วโมง
- Session จะถูกลบเมื่อ logout หรือ delete account
- ต้องส่ง cookie ทุกครั้งที่ request

### Transaction Categories
- Categories ถูกสร้างอัตโนมัติเมื่อ server start
- ไม่ต้องรัน SQL manually
- ดู categories ได้จาก GET /api/categories/*

### Transaction Amount
- ระบบจะแยกรายรับ-รายจ่ายอัตโนมัติตาม `type_id` ของ category
- ไม่ต้องระบุว่าเป็นรายรับหรือรายจ่าย แค่เลือก category ที่ถูกต้อง

### Auto-create Round
- ถ้าสร้าง transaction โดยไม่มี `round_id` แต่มี `plot_id`
- ระบบจะหา round ของ plot นั้น หรือสร้างรอบใหม่อัตโนมัติ
- ชื่อรอบจะเป็น "รอบการปลูกครั้งแรก"

---

**เอกสารนี้อัพเดทล่าสุด: 2025-01-17**
