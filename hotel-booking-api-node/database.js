const sqlite3 = require('sqlite3').verbose();

// สร้างการเชื่อมต่อกับฐานข้อมูล
const db = new sqlite3.Database('bookings.db', (err) => {
    if (err) {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
    } else {
        console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
        createTable();
    }
});

// สร้างตาราง bookings
const createTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        checkin DATE NOT NULL,
        checkout DATE NOT NULL,
        roomtype TEXT NOT NULL,
        guests INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.run(sql, (err) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการสร้างตาราง:', err);
        } else {
            console.log('สร้างตารางสำเร็จ');
        }
    });
};

module.exports = db;