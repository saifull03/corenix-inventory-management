-- CORENIX Enterprise Database Schema
-- Complete MySQL 8.0+ / MariaDB 10.4+ Schema

SET FOREIGN_KEY_CHECKS = 0;

-- 1. System Roles and Permissions
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `is_system` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  UNIQUE KEY `idx_module_action` (`module`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Branches, Warehouses & RMA Center
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `type` ENUM('shop', 'warehouse', 'rma_center') NOT NULL DEFAULT 'shop',
  `address` TEXT NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users (Staff & Admin)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT NOT NULL,
  `branch_id` INT NULL,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `avatar` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Dynamic Categories & Hierarchy
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `h1` VARCHAR(150) NULL,
  `image` VARCHAR(255) NULL,
  `banner` VARCHAR(255) NULL,
  `short_desc` TEXT NULL,
  `long_desc` LONGTEXT NULL,
  `order_index` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `meta_title` VARCHAR(200) NULL,
  `meta_desc` TEXT NULL,
  `focus_keyword` VARCHAR(100) NULL,
  `secondary_keywords` VARCHAR(255) NULL,
  `canonical_url` VARCHAR(255) NULL,
  `og_title` VARCHAR(200) NULL,
  `og_desc` TEXT NULL,
  `og_image` VARCHAR(255) NULL,
  `schema_markup` JSON NULL,
  `faq_json` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Brands
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `logo` VARCHAR(255) NULL,
  `banner` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `short_desc` TEXT NULL,
  `country` VARCHAR(80) NULL,
  `website` VARCHAR(255) NULL,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `meta_title` VARCHAR(200) NULL,
  `meta_desc` TEXT NULL,
  `focus_keyword` VARCHAR(100) NULL,
  `canonical_url` VARCHAR(255) NULL,
  `og_title` VARCHAR(200) NULL,
  `og_desc` TEXT NULL,
  `og_image` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Dynamic Specification Attributes & Groups
CREATE TABLE IF NOT EXISTS `attribute_groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `order_index` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attributes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `input_type` ENUM('text', 'select', 'multiselect', 'number', 'boolean', 'range') DEFAULT 'text',
  `is_filterable` BOOLEAN DEFAULT TRUE,
  `is_required` BOOLEAN DEFAULT FALSE,
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`group_id`) REFERENCES `attribute_groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attribute_values` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attribute_id` INT NOT NULL,
  `value` VARCHAR(150) NOT NULL,
  `label` VARCHAR(150) NOT NULL,
  FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `category_attributes` (
  `category_id` INT NOT NULL,
  `attribute_id` INT NOT NULL,
  `is_required` BOOLEAN DEFAULT FALSE,
  `filter_type` VARCHAR(30) DEFAULT 'checkbox',
  `filter_order` INT DEFAULT 0,
  `is_visible_filter` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`category_id`, `attribute_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `barcode` VARCHAR(100) NULL,
  `model` VARCHAR(100) NULL,
  `mpn` VARCHAR(100) NULL,
  `brand_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `product_type` ENUM('physical', 'bundle', 'digital') DEFAULT 'physical',
  `warranty_period` VARCHAR(80) DEFAULT '1 Year Official Warranty',
  `status` ENUM('published', 'draft', 'archived') DEFAULT 'published',
  `stock_status` VARCHAR(50) DEFAULT 'In Stock',
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_new` BOOLEAN DEFAULT FALSE,
  `is_hot` BOOLEAN DEFAULT FALSE,
  `is_sale` BOOLEAN DEFAULT FALSE,
  `is_preorder` BOOLEAN DEFAULT FALSE,
  `is_pc_builder` BOOLEAN DEFAULT FALSE,
  `pc_builder_component` VARCHAR(50) NULL,
  -- Pricing Structure
  `purchase_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `avg_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_price` DECIMAL(12,2) NULL,
  `min_selling_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) DEFAULT 0.00,
  `discount_percent` INT DEFAULT 0,
  -- Metrics
  `views_count` INT DEFAULT 0,
  `sales_count` INT DEFAULT 0,
  `rating_avg` DECIMAL(3,2) DEFAULT 5.00,
  `rating_count` INT DEFAULT 0,
  `seo_score` INT DEFAULT 85,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY `ft_product_search` (`name`, `model`, `sku`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Product Images & Gallery
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(255) NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Product Dynamic Specifications
CREATE TABLE IF NOT EXISTS `product_specifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `attribute_id` INT NOT NULL,
  `attribute_value` TEXT NOT NULL,
  `custom_label` VARCHAR(150) NULL,
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Structured Product Rich Content & Description
CREATE TABLE IF NOT EXISTS `product_descriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL UNIQUE,
  `overview` LONGTEXT NULL,
  `key_features_json` JSON NULL,
  `rich_content` LONGTEXT NULL,
  `what_in_box` TEXT NULL,
  `warranty_info` TEXT NULL,
  `faq_json` JSON NULL,
  `pros_cons_json` JSON NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Product SEO & OpenGraph
CREATE TABLE IF NOT EXISTS `product_seo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL UNIQUE,
  `meta_title` VARCHAR(255) NULL,
  `meta_desc` TEXT NULL,
  `focus_keyword` VARCHAR(100) NULL,
  `secondary_keywords` VARCHAR(255) NULL,
  `seo_description` TEXT NULL,
  `canonical_url` VARCHAR(255) NULL,
  `og_title` VARCHAR(255) NULL,
  `og_desc` TEXT NULL,
  `og_image` VARCHAR(255) NULL,
  `twitter_title` VARCHAR(255) NULL,
  `twitter_desc` TEXT NULL,
  `image_alt` VARCHAR(255) NULL,
  `structured_data_json` JSON NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Product Relationships
CREATE TABLE IF NOT EXISTS `product_relations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `related_product_id` INT NOT NULL,
  `relation_type` ENUM('related', 'compatible', 'bundle', 'frequently_bought') DEFAULT 'related',
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Location-Based Multi-Branch Inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `reserved_qty` INT NOT NULL DEFAULT 0,
  `incoming_qty` INT NOT NULL DEFAULT 0,
  `damaged_qty` INT NOT NULL DEFAULT 0,
  `rma_qty` INT NOT NULL DEFAULT 0,
  `min_stock_level` INT NOT NULL DEFAULT 5,
  `shelf_location` VARCHAR(80) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_product_branch` (`product_id`, `branch_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Inventory Audit Transactions
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `transaction_type` ENUM('purchase_receipt', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'damaged', 'rma_in', 'rma_out') NOT NULL,
  `quantity` INT NOT NULL,
  `reference_type` VARCHAR(50) NULL,
  `reference_id` INT NULL,
  `unit_cost` DECIMAL(12,2) DEFAULT 0.00,
  `notes` VARCHAR(255) NULL,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Stock Transfers
CREATE TABLE IF NOT EXISTS `stock_transfers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transfer_number` VARCHAR(50) NOT NULL UNIQUE,
  `from_branch_id` INT NOT NULL,
  `to_branch_id` INT NOT NULL,
  `status` ENUM('pending', 'in_transit', 'received', 'cancelled') DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `received_at` DATETIME NULL,
  FOREIGN KEY (`from_branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`to_branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_transfer_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transfer_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `received_qty` INT DEFAULT 0,
  FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `otp_code` VARCHAR(10) NULL,
  `otp_expires_at` DATETIME NULL,
  `is_verified` BOOLEAN DEFAULT TRUE,
  `reward_points` INT DEFAULT 0,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `title` VARCHAR(50) DEFAULT 'Home',
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address_line1` TEXT NOT NULL,
  `address_line2` TEXT NULL,
  `city` VARCHAR(80) NOT NULL,
  `zone` VARCHAR(80) NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Orders & POS Sales
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT NULL,
  `branch_id` INT NOT NULL,
  `order_type` ENUM('online', 'pos') DEFAULT 'online',
  `order_status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
  `payment_status` ENUM('unpaid', 'paid', 'partially_paid', 'refunded') DEFAULT 'unpaid',
  `payment_method` ENUM('cod', 'bkash', 'nagad', 'sslcommerz', 'card', 'cash_pos', 'emi') DEFAULT 'cod',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `coupon_code` VARCHAR(50) NULL,
  `shipping_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `due_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cogs_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `gross_profit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `shipping_address_json` JSON NULL,
  `notes` TEXT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `unit_cost` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `total_cost` DECIMAL(12,2) NOT NULL,
  `warranty_details` VARCHAR(100) NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `payment_number` VARCHAR(50) NOT NULL UNIQUE,
  `method` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `transaction_ref` VARCHAR(100) NULL,
  `gateway_response` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Suppliers & Purchasing / Procurement
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `contact_person` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `payment_terms` VARCHAR(100) DEFAULT 'Net 30',
  `tax_id` VARCHAR(50) NULL,
  `balance_due` DECIMAL(12,2) DEFAULT 0.00,
  `notes` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_number` VARCHAR(50) NOT NULL UNIQUE,
  `supplier_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `status` ENUM('draft', 'requested', 'approved', 'ordered', 'received', 'partial', 'cancelled') DEFAULT 'draft',
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `transport_cost` DECIMAL(12,2) DEFAULT 0.00,
  `other_cost` DECIMAL(12,2) DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_by` INT NOT NULL,
  `approved_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `received_qty` INT DEFAULT 0,
  `unit_cost` DECIMAL(12,2) NOT NULL,
  `total_cost` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT NOT NULL,
  `purchase_order_id` INT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Bank Transfer',
  `payment_date` DATE NOT NULL,
  `reference` VARCHAR(100) NULL,
  `notes` VARCHAR(255) NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. RMA / Service Center & Cost Tracking
CREATE TABLE IF NOT EXISTS `technicians` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `specialization` VARCHAR(100) DEFAULT 'Hardware Diagnostics',
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_vendors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NULL,
  `address` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rma_cases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rma_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `order_id` INT NULL,
  `product_id` INT NOT NULL,
  `serial_number` VARCHAR(100) NOT NULL,
  `problem_description` TEXT NOT NULL,
  `warranty_status` ENUM('in_warranty', 'out_of_warranty', 'void') DEFAULT 'in_warranty',
  `status` ENUM('received', 'inspection', 'diagnosis', 'repair', 'vendor', 'waiting_vendor', 'replacement', 'refund', 'ready_for_customer', 'delivered', 'closed') DEFAULT 'received',
  `technician_id` INT NULL,
  `vendor_id` INT NULL,
  -- RMA Cost Breakdown
  `parts_cost` DECIMAL(12,2) DEFAULT 0.00,
  `labor_cost` DECIMAL(12,2) DEFAULT 0.00,
  `transport_cost` DECIMAL(12,2) DEFAULT 0.00,
  `vendor_cost` DECIMAL(12,2) DEFAULT 0.00,
  `other_cost` DECIMAL(12,2) DEFAULT 0.00,
  `refund_cost` DECIMAL(12,2) DEFAULT 0.00,
  `replacement_cost` DECIMAL(12,2) DEFAULT 0.00,
  `total_rma_cost` DECIMAL(12,2) GENERATED ALWAYS AS (parts_cost + labor_cost + transport_cost + vendor_cost + other_cost + refund_cost + replacement_cost) STORED,
  `resolution_notes` TEXT NULL,
  `received_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `closed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`vendor_id`) REFERENCES `service_vendors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rma_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rma_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `notes` TEXT NULL,
  `updated_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rma_id`) REFERENCES `rma_cases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Expenses & Accounting
CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `receipt_image` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_by` INT NOT NULL,
  `is_approved` BOOLEAN DEFAULT TRUE,
  `approved_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Marketing, Campaigns & Coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `discount_type` ENUM('fixed', 'percentage') DEFAULT 'fixed',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_spend` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount` DECIMAL(10,2) NULL,
  `usage_limit` INT DEFAULT 100,
  `used_count` INT DEFAULT 0,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `banner` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. CMS Content & Static Pages
CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `content` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(200) NULL,
  `meta_desc` TEXT NULL,
  `is_published` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(255) NULL,
  `author` VARCHAR(100) DEFAULT 'CORENIX Editorial Team',
  `meta_title` VARCHAR(255) NULL,
  `meta_desc` TEXT NULL,
  `focus_keyword` VARCHAR(100) NULL,
  `is_published` BOOLEAN DEFAULT TRUE,
  `views_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(80) DEFAULT 'General',
  `order_index` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `link_url` VARCHAR(255) NOT NULL,
  `button_text` VARCHAR(50) DEFAULT 'Shop Now',
  `position` ENUM('hero', 'sidebar', 'middle', 'popup') DEFAULT 'hero',
  `order_index` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `landing_product_placements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `position` VARCHAR(40) NOT NULL,
  `product_id` INT NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_landing_position_product` (`position`, `product_id`),
  KEY `idx_landing_position` (`position`, `is_active`, `order_index`),
  CONSTRAINT `fk_landing_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. SEO Landing Page Builder
CREATE TABLE IF NOT EXISTS `seo_landing_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `h1` VARCHAR(255) NOT NULL,
  `intro_text` TEXT NULL,
  `category_id` INT NULL,
  `brand_id` INT NULL,
  `filter_criteria_json` JSON NULL,
  `dynamic_content` LONGTEXT NULL,
  `faq_json` JSON NULL,
  `meta_title` VARCHAR(255) NOT NULL,
  `meta_desc` TEXT NOT NULL,
  `focus_keyword` VARCHAR(100) NULL,
  `canonical_url` VARCHAR(255) NULL,
  `og_title` VARCHAR(255) NULL,
  `og_desc` TEXT NULL,
  `og_image` VARCHAR(255) NULL,
  `is_published` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. PC Builder Saved Builds & Compatibility Rules
CREATE TABLE IF NOT EXISTS `pc_builds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NULL,
  `build_name` VARCHAR(150) NOT NULL,
  `share_code` VARCHAR(50) NOT NULL UNIQUE,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `estimated_wattage` INT DEFAULT 350,
  `is_public` BOOLEAN DEFAULT TRUE,
  `items_json` JSON NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `compatibility_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `component_1` VARCHAR(50) NOT NULL,
  `component_2` VARCHAR(50) NOT NULL,
  `rule_type` VARCHAR(50) NOT NULL,
  `attribute_code` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Search Analytics & Zero Results
CREATE TABLE IF NOT EXISTS `search_analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `query` VARCHAR(255) NOT NULL,
  `results_count` INT DEFAULT 0,
  `hits_count` INT DEFAULT 1,
  `zero_results` BOOLEAN DEFAULT FALSE,
  `last_searched_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Operator Change Requests & Approval Workflow
CREATE TABLE IF NOT EXISTS `change_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module` VARCHAR(50) NOT NULL,
  `record_id` INT NOT NULL,
  `action_type` ENUM('price_update', 'stock_update', 'product_edit') NOT NULL,
  `old_value_json` JSON NOT NULL,
  `new_value_json` JSON NOT NULL,
  `reason` TEXT NOT NULL,
  `requested_by` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `reviewed_by` INT NULL,
  `reviewed_at` DATETIME NULL,
  `review_notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`),
  FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Enterprise Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(100) NULL,
  `role_name` VARCHAR(50) NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `record_id` INT NULL,
  `old_data_json` JSON NULL,
  `new_data_json` JSON NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. ERP Integration Logs & Queue
CREATE TABLE IF NOT EXISTS `erp_sync_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sync_type` ENUM('products', 'prices', 'stock', 'orders', 'customers') NOT NULL,
  `direction` ENUM('inbound', 'outbound') NOT NULL,
  `status` ENUM('success', 'failed', 'partial') NOT NULL,
  `items_count` INT DEFAULT 0,
  `payload_summary` TEXT NULL,
  `error_details` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Global Business Settings
CREATE TABLE IF NOT EXISTS `business_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NULL,
  `setting_group` VARCHAR(50) DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. SMS & Email Logs
CREATE TABLE IF NOT EXISTS `communication_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('sms', 'email') NOT NULL,
  `recipient` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) NULL,
  `content` TEXT NOT NULL,
  `status` ENUM('sent', 'failed', 'queued') DEFAULT 'sent',
  `provider_response` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Other House Purchases & Inter-Store Lend (অন্য হাউস ক্রয় / হাওলাত)
CREATE TABLE IF NOT EXISTS `other_house_purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tracking_number` VARCHAR(50) NOT NULL UNIQUE,
  `house_name` VARCHAR(150) NOT NULL,
  `house_contact` VARCHAR(100) NULL,
  `house_phone` VARCHAR(50) NULL,
  `house_address` TEXT NULL,
  `supplier_id` INT NULL,
  `branch_id` INT NOT NULL,
  `product_id` INT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_brand` VARCHAR(100) NULL,
  `product_category` VARCHAR(100) NULL,
  `product_model` VARCHAR(100) NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(12,2) NULL DEFAULT 0.00,
  `warranty_period` VARCHAR(100) NULL DEFAULT '1 Year Official Warranty',
  `is_lend` BOOLEAN NOT NULL DEFAULT TRUE,
  `payment_status` ENUM('lend', 'paid', 'partially_paid') NOT NULL DEFAULT 'lend',
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `due_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NULL,
  `payment_reference` VARCHAR(100) NULL,
  `paid_at` DATETIME NULL,
  `paid_by_name` VARCHAR(100) NULL,
  `payment_notes` TEXT NULL,
  `status` ENUM('in_stock', 'sold', 'returned_to_house', 'cancelled') NOT NULL DEFAULT 'in_stock',
  `notes` TEXT NULL,
  `created_by` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX `idx_serial` (`serial_number`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_house_name` (`house_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
