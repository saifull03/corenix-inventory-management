import React from 'react';
import ReportsView from './ReportsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Business Reports & Net Profit Analysis | CORENIX Admin',
  description: 'Detailed Sales Audit, Who & Where Selling, Buying and Selling Prices, and Net Profit Margin Analysis.',
};

export default function AdminReportsPage() {
  return <ReportsView />;
}
