CREATE DATABASE IF NOT EXISTS amazon_clone;
USE amazon_clone;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS order_status_transitions;
DROP TABLE IF EXISTS order_statuses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  account_type ENUM('free', 'pro', 'premium') NOT NULL DEFAULT 'free',
  location VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id INT NOT NULL,
  availability TINYINT(1) NOT NULL DEFAULT 1,
  visibility_tier ENUM('free', 'pro', 'premium') NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_cart_user_product (user_id, product_id)
);

CREATE TABLE order_statuses (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL,
  is_terminal TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE order_status_transitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_status VARCHAR(40) NOT NULL,
  to_status VARCHAR(40) NOT NULL,
  actor_role ENUM('admin', 'user', 'system') NOT NULL,
  requires_reason TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_transition_from FOREIGN KEY (from_status) REFERENCES order_statuses(code)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transition_to FOREIGN KEY (to_status) REFERENCES order_statuses(code)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_transition_rule (from_status, to_status, actor_role)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  status VARCHAR(40) NOT NULL,
  eta_days INT NULL,
  delay_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_status FOREIGN KEY (status) REFERENCES order_statuses(code)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_users_single_admin_before_insert;
DROP TRIGGER IF EXISTS trg_users_single_admin_before_update;

DELIMITER //
CREATE TRIGGER trg_users_single_admin_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.role = 'admin' AND (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one admin user is allowed';
  END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_users_single_admin_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.role = 'admin' AND OLD.role <> 'admin' AND (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one admin user is allowed';
  END IF;
END//
DELIMITER ;
