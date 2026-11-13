const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. GET /api/bookings - ดึงรายการการจองทั้งหมด
app.get('/api/bookings', (req, res) => {
    const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// 2. GET /api/bookings/:id - ดึงข้อมูลการจองตาม ID
app.get('/api/bookings/:id', (req, res) => {
    const sql = 'SELECT * FROM bookings WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ data: row });
    });
});

// 3. POST /api/bookings - สร้างการจองใหม่
app.post('/api/bookings', (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;

    if (!fullname || !email || !phone || !checkin || !checkout || !roomtype || !guests) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const sql = `INSERT INTO bookings (fullname, email, phone, checkin, checkout, roomtype, guests)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [fullname, email, phone, checkin, checkout, roomtype, guests];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Booking created successfully',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// 4. PUT /api/bookings/:id - แก้ไขข้อมูลการจอง
app.put('/api/bookings/:id', (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests, status } = req.body;
    const sql = `UPDATE bookings SET
        fullname = COALESCE(?, fullname),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        checkin = COALESCE(?, checkin),
        checkout = COALESCE(?, checkout),
        roomtype = COALESCE(?, roomtype),
        guests = COALESCE(?, guests),
        status = COALESCE(?, status)
        WHERE id = ?`;
    const params = [fullname, email, phone, checkin, checkout, roomtype, guests, status, req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking updated successfully' });
    });
});

// 5. DELETE /api/bookings/:id - ลบการจอง
app.delete('/api/bookings/:id', (req, res) => {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(204).send();
    });
});

// เริ่มต้นเปิดใช้งาน Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});