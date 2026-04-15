-- Migration: add missing columns to users table
-- These columns exist in the JPA User entity but were absent from the original
-- CREATE TABLE statement, causing "column does not exist" errors at runtime.
--
-- Safe to run multiple times: each statement uses IF NOT EXISTS / DO NOTHING.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture BYTEA;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture_content_type VARCHAR(50);
