const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// เชื่อมต่อฐานข้อมูล SQLite (สร้างไฟล์ bookings.db อัตโนมัติ)
const dbPath = path.resolve(__dirname, 'bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// สร้างตาราง bookings สำหรับเก็บข้อมูลการจอง
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            checkin TEXT NOT NULL,
            checkout TEXT NOT NULL,
            roomtype TEXT NOT NULL,
            guests INTEGER NOT NULL,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Bookings table ready.');
        }
    });
});

module.exports = db;