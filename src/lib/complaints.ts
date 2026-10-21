import { query } from '@/lib/db';

let tableReady: Promise<void> | null = null;

export function ensureComplaintsTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        customer_id BIGINT UNSIGNED NULL,
        customer_name VARCHAR(150) NOT NULL,
        email VARCHAR(190) NULL,
        phone VARCHAR(40) NOT NULL,
        category VARCHAR(80) NOT NULL DEFAULT 'General',
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'in_review', 'resolved', 'closed') NOT NULL DEFAULT 'new',
        admin_note TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        INDEX idx_complaints_status_created (status, created_at),
        INDEX idx_complaints_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).then(() => undefined).catch((error) => {
      tableReady = null;
      throw error;
    });
  }
  return tableReady;
}
