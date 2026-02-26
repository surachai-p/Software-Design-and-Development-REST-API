from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ตั้งค่า port ที่แตกต่างจาก Node.js
PORT = 5000

REQUIRED_FIELDS = ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests']

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def validate_booking_data(data):
    """ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่ คืนค่า list ของ field ที่ขาดหาย"""
    return [field for field in REQUIRED_FIELDS if not data.get(field)]

def create_table():
        conn = sqlite3.connect('bookings.db')
        conn.row_factory = dict_factory
        c = conn.cursor()
        sql= '''CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        checkin DATE NOT NULL,
        checkout DATE NOT NULL,
        roomtype TEXT NOT NULL,
        guests INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'''
        c.execute(sql)
        conn.commit()
        conn.close()

create_table()

# สร้างการจอง (Create)
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        data = request.json
        missing = validate_booking_data(data)
        if missing:
            return jsonify({'error': f'กรุณากรอกข้อมูลให้ครบถ้วน: {", ".join(missing)}'}), 400

        conn = sqlite3.connect('bookings.db')
        conn.row_factory = dict_factory
        c = conn.cursor()
        
        c.execute('''
            INSERT INTO bookings 
            (fullname, email, phone, checkin, checkout, roomtype, guests)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['fullname'],
            data['email'],
            data['phone'],
            data['checkin'],
            data['checkout'],
            data['roomtype'],
            data['guests']
        ))
        
        conn.commit()
        booking_id = c.lastrowid
        
        c.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,))
        booking = c.fetchone()
        
        conn.close()
        return jsonify(booking), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ดึงข้อมูลการจองทั้งหมด (Read)
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = sqlite3.connect('bookings.db')
    conn.row_factory = dict_factory
    c = conn.cursor()
    
    c.execute('SELECT * FROM bookings ORDER BY created_at DESC')
    bookings = c.fetchall()
    
    conn.close()
    return jsonify(bookings)

# ดึงข้อมูลการจองตาม ID (Read)
@app.route('/api/bookings/<int:id>', methods=['GET'])
def get_booking(id):
    conn = sqlite3.connect('bookings.db')
    conn.row_factory = dict_factory
    c = conn.cursor()
    
    c.execute('SELECT * FROM bookings WHERE id = ?', (id,))
    booking = c.fetchone()
    
    conn.close()
    
    if booking is None:
        return jsonify({'error': 'ไม่พบข้อมูลการจอง'}), 404
        
    return jsonify(booking)

# อัพเดตข้อมูลการจอง (Update)
@app.route('/api/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    try:
        data = request.json
        missing = validate_booking_data(data)
        if missing:
            return jsonify({'error': f'กรุณากรอกข้อมูลให้ครบถ้วน: {", ".join(missing)}'}), 400

        conn = sqlite3.connect('bookings.db')
        conn.row_factory = dict_factory
        c = conn.cursor()
        
        c.execute('''
            UPDATE bookings 
            SET fullname = ?,
                email = ?,
                phone = ?,
                checkin = ?,
                checkout = ?,
                roomtype = ?,
                guests = ?
            WHERE id = ?
        ''', (
            data['fullname'],
            data['email'],
            data['phone'],
            data['checkin'],
            data['checkout'],
            data['roomtype'],
            data['guests'],
            id
        ))
        
        conn.commit()
        
        if c.rowcount == 0:
            conn.close()
            return jsonify({'error': 'ไม่พบข้อมูลการจอง'}), 404
            
        c.execute('SELECT * FROM bookings WHERE id = ?', (id,))
        booking = c.fetchone()
        
        conn.close()
        return jsonify(booking)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ลบข้อมูลการจอง (Delete)
@app.route('/api/bookings/<int:id>', methods=['DELETE'])
def delete_booking(id):
    conn = sqlite3.connect('bookings.db')
    c = conn.cursor()
    
    c.execute('DELETE FROM bookings WHERE id = ?', (id,))
    conn.commit()
    
    if c.rowcount == 0:
        conn.close()
        return jsonify({'error': 'ไม่พบข้อมูลการจอง'}), 404
        
    conn.close()
    return '', 204

if __name__ == '__main__':
    app.run(port=PORT, debug=True)