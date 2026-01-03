-- PostgreSQL Schema for Render Free Hosting
-- This is a converted version of the MySQL schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    problem_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic VARCHAR(100) NOT NULL,
    time_taken INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_difficulty ON submissions(difficulty);
CREATE INDEX IF NOT EXISTS idx_topic ON submissions(topic);

