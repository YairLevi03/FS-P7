USE `online_banking`;

-- Reset tables (optional but good for testing)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `uploads`;
TRUNCATE TABLE `payments`;
TRUNCATE TABLE `standing_orders`;
TRUNCATE TABLE `transactions`;
TRUNCATE TABLE `accounts`;
TRUNCATE TABLE `branches`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- password for all users is: Password123!
-- hash: $2b$10$w6z/63D3m0Xw2V6y.8yX3.E2R8sR8eK5k8Y8W8k8Y8W8k8Y8W8k8Y (dummy hash, I'll use a real one here. Let's use bcrypt hash for '123456': $2b$10$UvF0PnpFt3RjaWW8oWHkm.pgBWZfepw0Utv.cIsx62EqNFdSiqqzu)

-- 1. Create a Manager
INSERT INTO `users` (`id`, `full_name`, `username`, `password_hash`, `role`, `phone`) 
VALUES (1, 'Admin Manager', 'admin', '$2b$10$UvF0PnpFt3RjaWW8oWHkm.pgBWZfepw0Utv.cIsx62EqNFdSiqqzu', 'manager', '050-1111111');

-- 2. Create a Branch
INSERT INTO `branches` (`id`, `name`, `address`, `manager_id`) 
VALUES (1, 'Main Branch Tel Aviv', '1 Rothschild Blvd, Tel Aviv', 1);

-- Update manager with branch_id
UPDATE `users` SET `branch_id` = 1 WHERE `id` = 1;

-- 3. Create Customers
INSERT INTO `users` (`id`, `full_name`, `username`, `password_hash`, `role`, `phone`, `branch_id`) 
VALUES 
(2, 'John Doe', 'john', '$2b$10$UvF0PnpFt3RjaWW8oWHkm.pgBWZfepw0Utv.cIsx62EqNFdSiqqzu', 'customer', '052-2222222', 1),
(3, 'Jane Smith', 'jane', '$2b$10$UvF0PnpFt3RjaWW8oWHkm.pgBWZfepw0Utv.cIsx62EqNFdSiqqzu', 'customer', '053-3333333', 1);

-- 4. Create Accounts
INSERT INTO `accounts` (`id`, `user_id`, `account_number`, `account_type`, `balance`, `currency`) 
VALUES 
(1, 2, '10000001', 'checking', 4800.00, 'ILS'),
(2, 2, '10000002', 'savings', 15000.00, 'ILS'),
(3, 3, '20000001', 'checking', 2700.00, 'ILS');

-- 5. Create Transactions
INSERT INTO `transactions` (`account_id`, `type`, `amount`, `related_account_id`, `description`, `status`) 
VALUES 
(1, 'deposit', 5000.00, NULL, 'Initial Deposit', 'completed'),
(2, 'deposit', 15000.00, NULL, 'Initial Deposit', 'completed'),
(3, 'deposit', 2500.00, NULL, 'Initial Deposit', 'completed'),
(1, 'transfer', -200.00, 3, 'Transfer to Jane', 'completed'),
(3, 'transfer', 200.00, 1, 'Received from John', 'completed');
-- Balance updates are handled here implicitly as initial deposits + transfers

-- 6. Create Standing Order
INSERT INTO `standing_orders` (`source_account_id`, `target_account_id`, `amount`, `frequency`, `next_run_date`) 
VALUES (1, 2, 500.00, 'monthly', DATE_ADD(CURDATE(), INTERVAL 1 MONTH));

-- 7. Create Payment
INSERT INTO `payments` (`account_id`, `payee_name`, `category`, `amount`, `status`) 
VALUES (1, 'Electric Company', 'Utilities', 350.00, 'completed');
