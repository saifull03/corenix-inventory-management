import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { queryOne } from './db';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'corenix_super_secure_jwt_token_key_2026_enterprise';

export interface TokenPayload {
  userId: number;
  email: string;
  roleId: number;
  roleSlug: string;
  branchId?: number | null;
  type: 'staff' | 'customer';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('corenix_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  if (decoded.type === 'staff') {
    const user = await queryOne<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.role_id, r.name as role_name, r.slug as role_slug,
              u.branch_id, b.name as branch_name, b.code as branch_code, u.status, u.avatar
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId]
    );
    return user || null;
  }

  return null;
}

export async function getCurrentCustomer(): Promise<any | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('corenix_cust_token')?.value || cookieStore.get('corenix_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'customer') return null;

  const customer = await queryOne<any>(
    `SELECT id, name, email, phone, is_verified, reward_points, status, created_at
     FROM customers
     WHERE id = ? AND status = 'active'`,
    [decoded.userId]
  );
  return customer || null;
}

interface CachedSession {
  data: {
    authenticated: boolean;
    userType: 'staff' | 'customer' | null;
    user: any | null;
  };
  expiresAt: number;
}

const sessionCache = new Map<string, CachedSession>();

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('corenix_token')?.value || cookieStore.get('corenix_cust_token')?.value;
  if (!token) {
    return {
      authenticated: false,
      userType: null,
      user: null,
    };
  }

  const now = Date.now();
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Prune cache if it gets large
  if (sessionCache.size > 200) {
    for (const [k, v] of sessionCache.entries()) {
      if (v.expiresAt <= now) sessionCache.delete(k);
    }
  }

  const decoded = verifyToken(token);
  let sessionResult: { authenticated: boolean; userType: 'staff' | 'customer' | null; user: any | null } = {
    authenticated: false,
    userType: null,
    user: null,
  };

  if (decoded?.type === 'staff') {
    const staff = await queryOne<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.role_id, r.name as role_name, r.slug as role_slug,
              u.branch_id, b.name as branch_name, b.code as branch_code, u.status, u.avatar
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId]
    );
    if (staff) {
      sessionResult = { authenticated: true, userType: 'staff', user: staff };
    }
  } else if (decoded?.type === 'customer') {
    const customer = await queryOne<any>(
      `SELECT id, name, email, phone, is_verified, reward_points, status, created_at
       FROM customers
       WHERE id = ? AND status = 'active'`,
      [decoded.userId]
    );
    if (customer) {
      sessionResult = { authenticated: true, userType: 'customer', user: customer };
    }
  }

  // Cache session for 20 seconds to eliminate redundant database queries across components
  sessionCache.set(token, { data: sessionResult, expiresAt: now + 20000 });
  return sessionResult;
}

export {
  hasPermission,
  isSuperAdmin,
  canManagePurchases,
  canPurchaseProducts,
  isStoreManagerOnly,
} from './permissions';



