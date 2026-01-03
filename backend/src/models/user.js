import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return { id: result.insertId, email };
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

