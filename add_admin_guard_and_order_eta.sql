USE amazon_clone;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS eta_days INT NULL AFTER status;

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
