-- Create database
CREATE DATABASE IF NOT EXISTS bitlydb;
USE bitlydb;

-- Create urls table
CREATE TABLE urls (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      original_url TEXT NOT NULL,
                      short_code VARCHAR(255) UNIQUE,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Make short_code case-sensitive (MySQL: 'a' != 'A')
ALTER TABLE urls
    MODIFY COLUMN short_code VARCHAR(255)
    COLLATE utf8mb4_bin;

-- Example: click table (assumed structure)
-- Fix AUTO_INCREMENT only if needed
ALTER TABLE click
    MODIFY COLUMN id BIGINT AUTO_INCREMENT;

-- View data
SELECT * FROM urls;
SELECT * FROM click;

-- Describe tables
DESC urls;
DESC click;
