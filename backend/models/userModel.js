import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = (name, email, phone, password, callback) => {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);
    const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone, hashedPassword], callback);
  });
};
