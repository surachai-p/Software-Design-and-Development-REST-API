from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

PORT = 5000

REQUIRED_FIELDS = ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests']


# แปลง row จาก sqlite เป็น dictionary
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


# ตรวจสอบข้อมูลครบหรือไม่
def validate_booking_data(data):
    return [field for field in REQUIRED_FIELDS if not data.get(field)]


# สร้างตารางถ้ายังไม่มี
def create_table():
    conn = sqlite3.connect('bookings.db')
    c = conn.cursor()

    c.execute('''
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
        )
    ''')

    conn.commit()
    conn.close()


create_table()


# -------------------- CREATE --------------------
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Invalid JSON'}), 400

        missing = validate_booking_data(data)
        if missing:
            return jsonify({'error': f'กรุณากรอกข้อมูลให้ครบ: {", ".join(missing)}'}), 400

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


# -------------------- READ ALL --------------------
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = sqlite3.connect('bookings.db')
    conn.row_factory = dict_factory
    c = conn.cursor()

    c.execute('SELECT * FROM bookings ORDER BY created_at DESC')
    bookings = c.fetchall()

    conn.close()
    return jsonify(bookings), 200


# -------------------- READ BY ID --------------------
@app.route('/api/bookings/<int:id>', methods=['GET'])
def get_booking(id):
    conn = sqlite3.connect('bookings.db')
    conn.row_factory = dict_factory
    c = conn.cursor()

    c.execute('SELECT * FROM bookings WHERE id = ?', (id,))
    booking = c.fetchone()

    conn.close()

    if not booking:
        return jsonify({'error': 'ไม่พบข้อมูลการจอง'}), 404

    return jsonify(booking), 200


# -------------------- UPDATE --------------------
@app.route('/api/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Invalid JSON'}), 400

        missing = validate_booking_data(data)
        if missing:
            return jsonify({'error': f'กรุณากรอกข้อมูลให้ครบ: {", ".join(missing)}'}), 400

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

        return jsonify(booking), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# -------------------- DELETE --------------------
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