-- ============================================================
-- Digital Products Marketplace — MySQL schema for CloudPanel
-- Run this in phpMyAdmin after creating the database.
-- ============================================================

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` varchar(36) NOT NULL,
  `name` text,
  `email` text,
  `password_hash` text,
  `avatar_url` text,
  `reset_token` text,
  `reset_token_expires` text,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','suspended','banned') NOT NULL DEFAULT 'active',
  `billing` json NOT NULL DEFAULT ('{}'),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','customer') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_role_unique` (`user_id`,`role`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `category_slug` text,
  `tags` json NOT NULL DEFAULT ('[]'),
  `image` text,
  `gallery` json NOT NULL DEFAULT ('[]'),
  `file_url` text,
  `variations` json NOT NULL DEFAULT ('[]'),
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `new_release` tinyint(1) NOT NULL DEFAULT 0,
  `best_seller` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` varchar(36) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` text,
  `user_email` text,
  `telegram` text,
  `whatsapp` text,
  `items` json NOT NULL DEFAULT ('[]'),
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` text,
  `status` enum('pending','payment_received','payment_not_received','in_progress','ready_for_delivery','delivered','refunded','cancel') NOT NULL DEFAULT 'pending',
  `payment_method` enum('crypto') DEFAULT NULL,
  `payment_txid` text,
  `payment_meta` json NOT NULL DEFAULT ('{}'),
  `billing` json NOT NULL DEFAULT ('{}'),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `user_name` text,
  `rating` int NOT NULL,
  `text` text,
  `approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` text NOT NULL,
  `excerpt` text,
  `content` text,
  `cover` text,
  `author` text,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `role` text,
  `text` text NOT NULL,
  `avatar` text,
  `rating` int NOT NULL DEFAULT 5,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` varchar(36) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pages` (
  `slug` varchar(255) NOT NULL,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `subject` text,
  `message` text NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` varchar(36) NOT NULL DEFAULT 'singleton',
  `brand` json NOT NULL DEFAULT ('{}'),
  `hero` json NOT NULL DEFAULT ('{}'),
  `integrations` json NOT NULL DEFAULT ('{}'),
  `payments` json NOT NULL DEFAULT ('{}'),
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default settings row
INSERT INTO `settings` (`id`) VALUES ('singleton') ON DUPLICATE KEY UPDATE `id`=`id`;

-- Create first admin (change email/password after running)
-- INSERT INTO `profiles` (`id`, `name`, `email`, `password_hash`) VALUES
--   ('admin-id-here', 'Admin', 'admin@example.com', '$2a$10$...bcrypt_hash_here...');
-- INSERT INTO `user_roles` (`id`, `user_id`, `role`) VALUES
--   (UUID(), 'admin-id-here', 'admin');
