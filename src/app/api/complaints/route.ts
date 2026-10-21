import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/auth';
import { ensureComplaintsTable } from '@/lib/complaints';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const category = String(body.category || 'General').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !phone || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Please complete your name, phone, subject, and complaint details.' }, { status: 400 });
    }
    if (name.length > 150 || phone.length > 40 || email.length > 190 || category.length > 80 || subject.length > 200 || message.length > 10000) {
      return NextResponse.json({ success: false, error: 'One or more fields are too long.' }, { status: 400 });
    }

    await ensureComplaintsTable();
    const customer = await getCurrentCustomer();
    const result: any = await query(
      `INSERT INTO complaints (customer_id, customer_name, email, phone, category, subject, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer?.id || null, name, email || null, phone, category || 'General', subject, message]
    );

    return NextResponse.json({ success: true, complaintId: result.insertId, message: 'Your complaint has been submitted. Our team will review it shortly.' }, { status: 201 });
  } catch (error) {
    console.error('Submit complaint error:', error);
    return NextResponse.json({ success: false, error: 'We could not submit your complaint. Please try again.' }, { status: 500 });
  }
}
