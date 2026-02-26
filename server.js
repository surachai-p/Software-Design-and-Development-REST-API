const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ฟังก์ชันตรวจสอบข้อมูลที่จำเป็น
const validateBookingData = (data) => {
    const required = ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests'];
    return required.filter(field => !data[field]);
};

//////////////////////////////////////////////////
// CREATE - สร้างการจองใหม่
//////////////////////////////////////////////////
app.post('/api/bookings', (req, res) => {
    const missingFields = validateBookingData(req.body);
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`
        });
    }

    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;

    const sql = `
        INSERT INTO bookings 
        (fullname, email, phone, checkin, checkout, roomtype, guests)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            message: "สร้างการจองสำเร็จ"
        });
    });
});

//////////////////////////////////////////////////
// READ - ดึงข้อมูลทั้งหมด
//////////////////////////////////////////////////
app.get('/api/bookings', (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY created_at DESC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json(rows);
    });
});

//////////////////////////////////////////////////
// READ - ดึงข้อมูลตาม ID
//////////////////////////////////////////////////
app.get('/api/bookings/:id', (req, res) => {
    const sql = "SELECT * FROM bookings WHERE id = ?";

    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
        }

        res.json(row);
    });
});

//////////////////////////////////////////////////
// UPDATE - แก้ไขข้อมูล
//////////////////////////////////////////////////
app.put('/api/bookings/:id', (req, res) => {
    const missingFields = validateBookingData(req.body);
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`
        });
    }

    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;

    const sql = `
        UPDATE bookings
        SET fullname = ?, email = ?, phone = ?,
            checkin = ?, checkout = ?, roomtype = ?, guests = ?
        WHERE id = ?
    `;

    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests, req.params.id],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
            }

            res.json({ message: "อัพเดตข้อมูลสำเร็จ" });
        }
    );
});

//////////////////////////////////////////////////
// DELETE - ลบข้อมูล
//////////////////////////////////////////////////
app.delete('/api/bookings/:id', (req, res) => {
    const sql = "DELETE FROM bookings WHERE id = ?";

    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
        }

        res.json({ message: "ลบข้อมูลสำเร็จ" });
    });
});

//////////////////////////////////////////////////
// เริ่มต้น Server
//////////////////////////////////////////////////
app.listen(port, () => {
    console.log(`Server กำลังทำงานที่ port ${port}`);
});