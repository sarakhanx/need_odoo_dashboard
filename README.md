# Odoo 17 Custom Dashboard Module

## 📊 ภาพรวม

โมดูลนี้เป็น Custom Dashboard สำหรับ Odoo 17 Community Edition ที่แสดงข้อมูล KPI และกราฟสำหรับ:

- คำสั่งขาย (Sales Orders)
- ใบเสนอราคา (Quotations)
- ใบแจ้งหนี้ (Receipts)

## ✨ คุณสมบัติ

- 📅 ตัวกรองตามช่วงวันที่
- 📊 แสดง KPI สำคัญ:
  - ยอดขายทั้งหมด
  - จำนวนรายการ
  - ค่าเฉลี่ยต่อรายการ
- 📈 กราฟแสดงข้อมูลรายวัน
- 🎨 การออกแบบที่ทันสมัยด้วย Bootstrap

## 🔧 การติดตั้ง

1. ติดตั้ง dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. เพิ่มโมดูลลงใน addons path ของ Odoo

3. ติดตั้งโมดูลผ่าน Odoo Apps หรือใช้คำสั่ง:

   ```bash
   python3 odoo-bin -d your_database -i odoo_dashboard
   ```

## 📁 โครงสร้างไฟล์

```bash
odoo_dashboard/
├── models/
│   └── dashboard_handler.py    # โมเดลสำหรับดึงข้อมูล KPI
├── static/
│   └── src/
│       └── components/
│           └── dashboard/
│               ├── dashboard.js   # Logic ของ Dashboard
│               └── dashboard.xml  # Template ของ Dashboard
├── security/
│   └── ir.model.access.csv    # กำหนดสิทธิ์การเข้าถึง
├── views/
│   └── dashboard_views.xml    # มุมมองของ Dashboard
├── __init__.py
├── __manifest__.py
└── README.md
```

## 🛠 การพัฒนา

โมดูลนี้พัฒนาด้วย:

- OWL Framework (Odoo Web Library)
- Chart.js สำหรับการแสดงกราฟ
- Bootstrap 5 สำหรับ UI

## 🔍 การใช้งาน

1. เข้าสู่เมนู Dashboard
2. เลือกช่วงวันที่ที่ต้องการดูข้อมูล
3. ระบบจะแสดง:
   - KPI cards สำหรับแต่ละประเภทเอกสาร
   - กราฟแสดงข้อมูลรายวัน

### **พัฒนาโดย แอ๋ม (Sarawut Khantiyoo)**

- Website: `https://erp.needshopping.co`
- Email: `sarawut.khan@hotmail.com`
# need_odoo_dashboard
