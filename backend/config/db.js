// db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('config/.env') });

const connection = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD, 
database: process.env.DB_NAME,
port: process.env.DB_PORT
  
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database.');
});

export default connection;

