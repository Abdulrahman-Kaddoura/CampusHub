-- CampusHub PostgreSQL schema aligned with JPA entities in backend/backend/src/main/java/com/campushub/backend/models
-- Run this script on RDS before starting the app if you do not want Hibernate auto-ddl to manage schema.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
  profile_picture BYTEA,
  profile_picture_content_type VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  email_verification_token VARCHAR(255),
  email_verification_expires_at TIMESTAMP,
  email_verified_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  parent_id UUID,
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES category(category_id)
);

CREATE TABLE IF NOT EXISTS listings (
  listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  category_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  user_id UUID NOT NULL,
  buyer_id UUID,
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES category(category_id),
  CONSTRAINT fk_listings_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_listings_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS listing_images (
  image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(255) NOT NULL,
  image_data BYTEA NOT NULL,
  file_size BIGINT,
  upload_date TIMESTAMP,
  listing_id UUID NOT NULL,
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
);

CREATE TABLE IF NOT EXISTS cart (
  cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  listings_quantity INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL UNIQUE,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  cart_id UUID,
  CONSTRAINT fk_cart_items_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
);

CREATE TABLE IF NOT EXISTS dorms (
  dorm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  location VARCHAR(150) NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  available_from DATE NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  user_id UUID NOT NULL,
  CONSTRAINT fk_dorms_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS tutoring_posts (
  tutoring_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course VARCHAR(120) NOT NULL,
  tutor_name VARCHAR(120) NOT NULL,
  department VARCHAR(80) NOT NULL,
  format VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  user_id UUID NOT NULL,
  CONSTRAINT fk_tutoring_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS course_exchange_posts (
  course_exchange_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_course VARCHAR(120) NOT NULL,
  desired_course VARCHAR(120) NOT NULL,
  section VARCHAR(50),
  status VARCHAR(40) NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  user_id UUID NOT NULL,
  CONSTRAINT fk_course_exchange_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

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

-- Togglz feature flag state table (used by JDBCStateRepository, table name configured in TogglzConfig.java)
CREATE TABLE IF NOT EXISTS feature_status (
  feature_name VARCHAR(100) PRIMARY KEY,
  feature_enabled INTEGER NOT NULL DEFAULT 1,
  strategy_id VARCHAR(200),
  strategy_params VARCHAR(2000)
);

-- Seed all feature flags as enabled so fresh deployments don't silently disable any API.
-- ON CONFLICT DO NOTHING preserves any intentional overrides already stored in the table.
INSERT INTO feature_status (feature_name, feature_enabled) VALUES
  ('REGISTER', 1),
  ('LOGIN', 1),
  ('CREATE_USER', 1),
  ('DELETE_USER', 1),
  ('GET_USER_BY_ID', 1),
  ('GET_USER_BY_USERNAME', 1),
  ('GET_USER_BY_EMAIL', 1),
  ('CREATE_LISTING', 1),
  ('BUY_LISTING', 1),
  ('GET_ALL_LISTINGS', 1),
  ('GET_ALL_LISTINGS_BY_USER', 1),
  ('GET_ALL_LISTINGS_BY_CATEGORY', 1),
  ('DELETE_LISTING', 1),
  ('AI_SEARCH_LISTINGS', 1),
  ('CREATE_WANTED_ITEM', 1),
  ('GET_ALL_WANTED_ITEMS', 1),
  ('GET_ALL_WANTED_ITEMS_BY_USER', 1),
  ('DELETE_WANTED_ITEM', 1),
  ('CREATE_CATEGORY', 1),
  ('DELETE_CATEGORY_BY_ID', 1),
  ('DELETE_CATEGORY_BY_NAME', 1),
  ('GET_ALL_CATEGORIES', 1),
  ('UPLOAD_LISTING_IMAGE', 1),
  ('DOWNLOAD_LISTING_IMAGE', 1),
  ('GET_LISTING_IMAGES', 1),
  ('DELETE_LISTING_IMAGE', 1),
  ('CREATE_DORM', 1),
  ('GET_ALL_DORMS', 1),
  ('GET_ALL_DORMS_BY_USER', 1),
  ('DELETE_DORM', 1),
  ('CREATE_TUTORING', 1),
  ('GET_ALL_TUTORING', 1),
  ('GET_ALL_TUTORING_BY_USER', 1),
  ('DELETE_TUTORING', 1),
  ('CREATE_COURSE_EXCHANGE', 1),
  ('GET_ALL_COURSE_EXCHANGES', 1),
  ('GET_ALL_COURSE_EXCHANGES_BY_USER', 1),
  ('DELETE_COURSE_EXCHANGE', 1),
  ('GET_CART_BY_CART_ID', 1),
  ('GET_CART_BY_USER_ID', 1),
  ('CART_ADD_ITEM', 1),
  ('CART_CHECKOUT', 1),
  ('BUY_CART', 1),
  ('GET_CART_ITEMS', 1),
  ('CREATE_CART_ITEM', 1),
  ('DELETE_CART_ITEM', 1),
  ('CHAT_SEND_MESSAGE', 1),
  ('CHAT_GET_MESSAGES', 1),
  ('CHAT_GET_CONVERSATIONS', 1),
  ('CHAT_GET_USERS', 1)
ON CONFLICT (feature_name) DO NOTHING;
