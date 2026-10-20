import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const pool = global._mysqlPool || mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export default pool;

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.query(sql, params);
    return rows as T;
  } catch (error: any) {
    console.error('Database query error:', error?.message || error);
    // If database connection is down, return empty array for SELECT queries to avoid SSR 500 crash
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return [] as unknown as T;
    }
    throw error;
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  try {
    const rows = await query<any[]>(sql, params);
    if (rows && rows.length > 0) {
      return rows[0] as T;
    }
    return null;
  } catch (error: any) {
    console.error('Database queryOne error:', error?.message || error);
    return null;
  }
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection();
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

