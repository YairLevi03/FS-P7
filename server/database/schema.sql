DROP DATABASE IF EXISTS `online_banking`;
CREATE DATABASE IF NOT EXISTS `online_banking`;
USE `online_banking`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'manager') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(20),
  `branch_id` INT,
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `manager_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Adding foreign key to users after branches table is created
ALTER TABLE `users` ADD CONSTRAINT `fk_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `account_number` VARCHAR(20) NOT NULL UNIQUE,
  `account_type` ENUM('checking', 'savings') NOT NULL DEFAULT 'checking',
  `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'ILS',
  `status` ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `account_id` INT NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'check_deposit') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `related_account_id` INT, -- Nullable, used for transfers between internal accounts
  `payee_name` VARCHAR(100), -- Used for external payments or transfers
  `description` VARCHAR(255),
  `check_image_path` VARCHAR(255), -- Used for simulated check deposits
  `status` ENUM('pending', 'completed', 'rejected') NOT NULL DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `cards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `account_id` INT NOT NULL,
  `card_number` VARCHAR(16) NOT NULL UNIQUE,
  `expiration_date` VARCHAR(5) NOT NULL, -- MM/YY
  `cvv` VARCHAR(4) NOT NULL,
  `limit_amount` DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
  `status` ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `loans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `interest_rate` DECIMAL(5, 2) NOT NULL,
  `term_months` INT NOT NULL,
  `purpose` VARCHAR(255),
  `status` ENUM('pending', 'approved', 'rejected', 'paid_off') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `deposits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `interest_rate` DECIMAL(5, 2) NOT NULL,
  `maturity_date` DATE NOT NULL,
  `status` ENUM('active', 'broken', 'matured') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `standing_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source_account_id` INT NOT NULL,
  `target_account_id` INT,
  `amount` DECIMAL(15, 2) NOT NULL,
  `frequency` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
  `next_run_date` DATE NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`target_account_id`) REFERENCES `accounts`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `account_id` INT NOT NULL,
  `payee_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50),
  `amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('pending', 'completed', 'rejected') NOT NULL DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `uploads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50),
  `related_entity` VARCHAR(50), -- e.g., 'transaction_123', 'profile'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT, -- Nullable, because a failed login might not tie to a valid user ID initially (or ties to the attempted user)
  `action_type` VARCHAR(100) NOT NULL, -- e.g., 'LOGIN_FAILED', 'FUND_TRANSFER', 'CARD_BLOCKED'
  `description` TEXT,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
