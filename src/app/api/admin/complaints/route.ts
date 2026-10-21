import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ensureComplaintsTable } from '@/lib/complaints';

async function requireStaff() {
  return getCurrentUser();
}

export async function GET() {
  try {
    const staff = await requireStaff();
    if (!staff) return NextResponse.json({ success: false, error: 'Staff access required.' }, { status: 403 });
    await ensureComplaintsTable();
    const complaints = await query<any[]>(`SELECT * FROM complaints ORDER BY created_at DESC`);
    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load complaints.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const staff = await requireStaff();
    if (!staff) return NextResponse.json({ success: false, error: 'Staff access required.' }, { status: 403 });
    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status || '');
    const adminNote = body.adminNote == null ? null : String(body.adminNote).trim();
    const allowedStatuses = ['new', 'in_review', 'resolved', 'closed'];
    if (!Number.isInteger(id) || id < 1 || !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'A valid complaint and status are required.' }, { status: 400 });
    }
    if (adminNote && adminNote.length > 10000) {
      return NextResponse.json({ success: false, error: 'The internal note is too long.' }, { status: 400 });
    }
    await ensureComplaintsTable();
    const existing = await queryOne<any>(`SELECT id FROM complaints WHERE id = ?`, [id]);
    if (!existing) return NextResponse.json({ success: false, error: 'Complaint not found.' }, { status: 404 });

    await query(
      `UPDATE complaints SET status = ?, admin_note = ?, resolved_at = ${status === 'resolved' ? 'COALESCE(resolved_at, CURRENT_TIMESTAMP)' : 'NULL'} WHERE id = ?`,
      [status, adminNote || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update complaint.' }, { status: 500 });
  }
}
