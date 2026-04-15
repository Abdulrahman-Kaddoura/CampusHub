-- V2: add columns missing from the original users table definition
-- These fields exist in the User JPA entity but were absent from the initial
-- CREATE TABLE, causing "column does not exist" errors at runtime.
-- Safe to run on fresh DBs (IF NOT EXISTS is a no-op when V1 already created them).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture BYTEA;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture_content_type VARCHAR(50);
