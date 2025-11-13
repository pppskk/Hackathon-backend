# Hackathon Backend API

## การเริ่มต้นใช้งาน
- `npm install` เพื่อติดตั้ง dependencies (ตรวจสอบ `package.json` สำหรับรายการแพ็กเกจ)
- ตั้งค่าการเชื่อมต่อฐานข้อมูลใน `function/postgre.js`
- รันเซิร์ฟเวอร์ด้วย `node index.js` (เซิร์ฟเวอร์ทำงานที่ `http://localhost:3005`)
- เมื่อเริ่มต้น เซิร์ฟเวอร์จะเรียก `sync({ force: true })` เพื่อรีเซ็ต schema ตามโมเดล (`ใช้ด้วยความระมัดระวัง`)

## ภาพรวมโครงสร้างข้อมูล
| ตาราง | คีย์หลัก | ฟิลด์สำคัญ | ความสัมพันธ์ |
|-------|----------|-------------|----------------|
| `users` | `user_id` | `firstName`, `lastName`, `phone`, `userPicture` | เชื่อมกับ `plots`, `production_rounds`, `transactions` |
| `plants` | `plant_id` | `plant_name`, `user_id` | ใช้เชื่อมกับ `plots` |
| `plots` | `plot_id` | `plot_name`, `area_size`, `plant_id`, `user_id` | เชื่อมกับ `plants`, `users`, `production_rounds` |
| `production_rounds` | `round_id` | `plot_id`, `user_id`, `round_name`, `start_date`, `end_date`, `yield_unit`, `income_total`, `expense_total` | เชื่อมกับ `plots`, `users`, `transactions` |
| `transaction_types` | `id` | `name`, `description` | `income` / `expense` |
| `transaction_categories` | `id` | `type_id`, `name`, `description` | เชื่อมกับ `transaction_types`, `transactions` |
| `transactions` | `id` | `round_id`, `user_id`, `category_id`, `amount`, `note`, `date` | เชื่อมกับ `production_rounds`, `transaction_categories`, `users` |

## เส้นทาง API หลัก
ทุกเส้นทางอยู่ภายใต้ prefix `/api`

### 1. `/api/users`
| เมธอด | พาธ | หน้าที่ | ขั้นตอนการทำงาน |
|-------|------|--------|-------------------|
| `POST` | `/register` | ลงทะเบียนผู้ใช้ใหม่ | ตรวจ `phone` (ต้องมีรูปแบบเบอร์ไทยและไม่ซ้ำ), สร้างผู้ใช้, เก็บ `user_id` และ `phone` ใน session |
| `PUT` | `/update` | แก้ไขข้อมูลผู้ใช้ (ต้องล็อกอิน) | รับ `user_id` + ฟิลด์ที่ต้องการอัปเดต, ตรวจสอบว่าผู้ใช้มีอยู่จริง, validate หมายเลขโทรศัพท์ใหม่, บันทึกและคืนข้อมูลล่าสุด |
| `POST` | `/login` | (โครงร่าง) ขอ OTP | ตรวจรูปแบบเบอร์, รอเชื่อมต่อบริการ OTP ภายนอก, ปัจจุบันตอบกลับสำเร็จทันที |
| `POST` | `/logout` | ออกจากระบบ | ทำลาย session |
| `GET` | `/check` | ตรวจสอบสถานะล็อกอิน | คืน `user_id` และ `phone` จาก session |
| `GET` | `/:id` | ดูข้อมูลผู้ใช้รายคน (ต้องเป็นเจ้าของเอง) | ค้นหา `users` ตาม `user_id`, ส่งคืนข้อมูลพื้นฐาน |
| `DELETE` | `/delete/:id` | ลบผู้ใช้ (ต้องเป็นเจ้าของ) | ลบข้อมูลจาก `users` และทำลาย session |
| `GET` | `/profile/:userId` | ดึงข้อมูลโปรไฟล์ | คืนข้อมูลผู้ใช้จากฐานข้อมูล |
| `PUT` | `/profile/:userId` | แก้ไขโปรไฟล์ | ตรวจสอบผู้ใช้, validate หมายเลขโทรศัพท์, ป้องกันเบอร์ซ้ำ, บันทึกและคืนค่าที่อัปเดต |

> หมายเหตุ: endpoint ฝาก/ถอน ถูกถอดออกเพื่อให้สอดคล้องกับโครงสร้าง `users` ปัจจุบันที่ไม่มีฟิลด์ยอดเงิน

### 2. `/api/plots`
| เมธอด | พาธ | หน้าที่ | ขั้นตอนการทำงาน |
|-------|------|--------|-------------------|
| `POST` | `/` | สร้างแปลงพืชใหม่ | รับ `plant_id`, `plot_name`, `area_size`, `user_id`, ตรวจสอบว่ามีผู้ใช้และพืชจริง, บันทึกข้อมูลใน `plots` |
| `GET` | `/:userId` | ดึงแปลงพืชทั้งหมดของผู้ใช้ | ตรวจสอบว่าผู้ใช้มีอยู่, ดึงแปลงทั้งหมด, ผูก `plant_name` ด้วยการ lookup จาก `plants`, ส่งกลับรายการพร้อมจำนวนรวม |

### 3. `/api/transactions`
| เมธอด | พาธ | หน้าที่ | ขั้นตอนการทำงาน |
|-------|------|--------|-------------------|
| `POST` | `/` | บันทึกรายการรายรับ/รายจ่าย | รับ `{ amount, date, category_id, round_id, note, user_id }`, ตรวจสอบ `amount` > 0, ตรวจสอบ user และหมวดหมู่รวมถึงรอบการผลิต (ถ้ามี), บันทึกลง `transactions` |
| `GET` | `/:userId` | สรุปข้อมูลการเงินของผู้ใช้ | ตรวจสอบผู้ใช้, ดึง `plots` ทั้งหมด, ดึง `transactions` พร้อม `transaction_categories` และ `transaction_types`, คำนวณรายรับ-รายจ่าย-กำไรสุทธิ และสรุปยอดตามหมวดหมู่ |
| `GET` | `/` (query `plotId`) | แสดงรายละเอียดการเงินตามแปลง | ตรวจสอบแปลง, หา `production_rounds` ที่เกี่ยวข้อง, ดึง `transactions` ของรอบเหล่านั้น, คำนวณรายรับ/รายจ่ายและ breakdown ค่าใช้จ่าย |
| `GET` | `/` | ดึงรายการทั้งหมด | ถ้าไม่มี `plotId`, คืนรายการธุรกรรมทั้งหมดเรียงตามวันที่ พร้อมรายละเอียดหมวดหมู่และประเภท |

## ข้อควรทราบ
- ระบบ session ใช้ `express-session` เก็บสถานะในหน่วยความจำ (ควรเปลี่ยนเป็น store ที่เหมาะสมในสภาพ production)
- ENDPOINT ที่ต้องการการป้องกัน (เช่น `requireAuth`, `requireOwnership`) ยังคงอาศัย middleware ใน `function/users.js`
- การจัดการ OTP, Dashboard, Plants, Rounds ยังเป็นต้นแบบ/รอการพัฒนาต่อ
- โค้ดถูกปรับให้สอดคล้องกับ schema ปัจจุบันโดยไม่แก้ไขไฟล์ใน `models`

## การทดสอบ
- สามารถใช้เครื่องมือ เช่น Postman/Insomnia เรียกแต่ละ endpoint ได้ตามตัวอย่างในตาราง
- ควรเตรียมข้อมูลอ้างอิง (เช่น category, plant, round) ในฐานข้อมูลก่อนเรียก endpoint ที่ต้องใช้ FK
# hackathon-backend