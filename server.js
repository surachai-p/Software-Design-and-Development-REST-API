const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// สร้างการจองใหม่ (Create)
app.post('/api/bookings', (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;
    
    const sql = `INSERT INTO bookings (fullname, email, phone, checkin, checkout, roomtype, guests)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        
        res.status(201).json({
            id: this.lastID,
            message: "สร้างการจองสำเร็จ"
        });
    });
});

// ดึงข้อมูลการจองทั้งหมด (Read)
app.get('/api/bookings', (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY created_at DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ดึงข้อมูลการจองตาม ID (Read)
app.get('/api/bookings/:id', (req, res) => {
    const sql = "SELECT * FROM bookings WHERE id = ?";
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
            return;
        }
        res.json(row);
    });
});

// อัพเดตข้อมูลการจอง (Update)
app.put('/api/bookings/:id', (req, res) => {
    const { fullname, email, phone, checkin, checkout, roomtype, guests } = req.body;
    
    const sql = `UPDATE bookings 
                 SET fullname = ?, email = ?, phone = ?, 
                     checkin = ?, checkout = ?, roomtype = ?, guests = ?
                 WHERE id = ?`;
    
    db.run(sql, [fullname, email, phone, checkin, checkout, roomtype, guests, req.params.id], 
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
                return;
            }
            res.json({ message: "อัพเดตข้อมูลสำเร็จ" });
    });
});

// ลบข้อมูลการจอง (Delete)
app.delete('/api/bookings/:id', (req, res) => {
    const sql = "DELETE FROM bookings WHERE id = ?";
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: "ไม่พบข้อมูลการจอง" });
            return;
        }
        res.json({ message: "ลบข้อมูลสำเร็จ" });
    });
});

// เริ่มต้น server
app.listen(port, () => {
    console.log(`Server กำลังทำงานที่ port ${port}`);
});