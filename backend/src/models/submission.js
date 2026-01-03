import pool from '../config/database.js';

export class Submission {
  static async create(userId, data) {
    const { problem_name, difficulty, topic, time_taken } = data;
    const [result] = await pool.execute(
      'INSERT INTO submissions (user_id, problem_name, difficulty, topic, time_taken) VALUES (?, ?, ?, ?, ?)',
      [userId, problem_name, difficulty, topic, time_taken]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId, { page = 1, limit = 10, difficulty, topic, search, sortBy = 'created_at', sortOrder = 'DESC' } = {}) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    let query = 'SELECT * FROM submissions WHERE user_id = ?';
    const params = [userId];
    const countParams = [userId];

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
      countParams.push(difficulty);
    }

    if (topic) {
      query += ' AND topic = ?';
      params.push(topic);
      countParams.push(topic);
    }

    if (search) {
      query += ' AND problem_name ILIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam);
      countParams.push(searchParam);
    }

    const allowedSortFields = ['created_at', 'difficulty', 'topic', 'time_taken', 'problem_name'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${validSortBy} ${validSortOrder} LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.execute(query, params);
    
    let countQuery = 'SELECT COUNT(*) as total FROM submissions WHERE user_id = ?';
    if (difficulty || topic || search) {
      if (difficulty) countQuery += ' AND difficulty = ?';
      if (topic) countQuery += ' AND topic = ?';
      if (search) countQuery += ' AND problem_name ILIKE ?';
    }
    const [countRows] = await pool.execute(countQuery, countParams);

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  }

  static async update(id, userId, data) {
    const { problem_name, difficulty, topic, time_taken } = data;
    await pool.execute(
      'UPDATE submissions SET problem_name = ?, difficulty = ?, topic = ?, time_taken = ? WHERE id = ? AND user_id = ?',
      [problem_name, difficulty, topic, time_taken, id, userId]
    );
    return this.findById(id);
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM submissions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async findAllByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }
}

