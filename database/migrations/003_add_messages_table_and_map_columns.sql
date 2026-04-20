-- Migration: create messages table and add map-related columns
-- The messages table was previously managed by Hibernate auto-DDL.
-- This migration makes it explicit and adds message_type, latitude, longitude
-- which were added to the Message entity for the map/location feature.
--
-- Safe to run multiple times: uses IF NOT EXISTS / DO NOTHING.

CREATE TABLE IF NOT EXISTS messages (
  message_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content      VARCHAR(2000) NOT NULL,
  message_type VARCHAR(20)   NOT NULL DEFAULT 'TEXT',
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  sent_at      TIMESTAMP     NOT NULL,
  CONSTRAINT fk_messages_sender    FOREIGN KEY (sender_id)    REFERENCES users(user_id),
  CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(user_id)
);

-- For existing deployments where the table already exists without the new columns:
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;

-- Envers audit table for messages
CREATE TABLE IF NOT EXISTS messages_aud (
  message_id   UUID        NOT NULL,
  rev          INTEGER     NOT NULL,
  revtype      SMALLINT,
  sender_id    UUID,
  recipient_id UUID,
  content      VARCHAR(2000),
  message_type VARCHAR(20),
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  sent_at      TIMESTAMP,
  PRIMARY KEY (message_id, rev)
);

ALTER TABLE messages_aud ADD COLUMN IF NOT EXISTS message_type VARCHAR(20);
ALTER TABLE messages_aud ADD COLUMN IF NOT EXISTS latitude     DOUBLE PRECISION;
ALTER TABLE messages_aud ADD COLUMN IF NOT EXISTS longitude    DOUBLE PRECISION;
