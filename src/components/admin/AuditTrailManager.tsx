'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Shield,
  User,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  Copy,
  Check,
  Tag,
  AlertTriangle,
  Flame,
  Star,
  Activity,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export interface AuditLogItem {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  role_name?: string | null;
  module: string;
  action: string;
  record_id?: number | null;
  old_data_json?: any;
  new_data_json?: any;
  ip_address?: string | null;
  created_at: string;
}

interface Props {
  initialLogs: AuditLogItem[];
}

export default function AuditTrailManager({ initialLogs }: Props) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Extract unique users and modules for filters
  const usersList = useMemo(() => {
    const set = new Set<string>();
    initialLogs.forEach((l) => {
      if (l.user_name) set.add(l.user_name);
    });
    return Array.from(set).sort();
  }, [initialLogs]);

  const modulesList = useMemo(() => {
    const set = new Set<string>();
    initialLogs.forEach((l) => {
      if (l.module) set.add(l.module);
    });
    return Array.from(set).sort();
  }, [initialLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date().getTime();

    return logs.filter((l) => {
      // User filter
      if (selectedUser !== 'all' && l.user_name !== selectedUser) return false;

      // Module filter
      if (selectedModule !== 'all' && l.module.toLowerCase() !== selectedModule.toLowerCase()) return false;

      // Action filter
      if (selectedAction !== 'all') {
        const act = (l.action || '').toLowerCase();
        if (selectedAction === 'create' && !act.includes('create') && !act.includes('add') && !act.includes('insert')) return false;
        if (selectedAction === 'edit' && !act.includes('edit') && !act.includes('update') && !act.includes('patch') && !act.includes('toggle')) return false;
        if (selectedAction === 'delete' && !act.includes('delete') && !act.includes('archive') && !act.includes('remove')) return false;
        if (selectedAction === 'status' && !act.includes('status') && !act.includes('toggle')) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const logTime = new Date(l.created_at).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);
        if (dateFilter === 'today' && diffHours > 24) return false;
        if (dateFilter === '7days' && diffHours > 24 * 7) return false;
        if (dateFilter === '30days' && diffHours > 24 * 30) return false;
      }

      // Search match
      if (!q) return true;

      const userName = (l.user_name || '').toLowerCase();
      const roleName = (l.role_name || '').toLowerCase();
      const moduleName = (l.module || '').toLowerCase();
      const actionName = (l.action || '').toLowerCase();
      const recordIdStr = String(l.record_id || '');
      const ip = (l.ip_address || '').toLowerCase();
      const newJsonStr = typeof l.new_data_json === 'string' ? l.new_data_json.toLowerCase() : JSON.stringify(l.new_data_json || '').toLowerCase();

      return (
        userName.includes(q) ||
        roleName.includes(q) ||
        moduleName.includes(q) ||
        actionName.includes(q) ||
        recordIdStr.includes(q) ||
        ip.includes(q) ||
        newJsonStr.includes(q)
      );
    });
  }, [logs, searchQuery, selectedUser, selectedModule, selectedAction, dateFilter]);

  // Metrics
  const stats = useMemo(() => {
    const todayLogs = initialLogs.filter((l) => {
      const logTime = new Date(l.created_at).getTime();
      return (new Date().getTime() - logTime) / (1000 * 60 * 60) <= 24;
    });

    const uniqueAdmins = new Set(initialLogs.map((l) => l.user_name || 'System')).size;
    const criticalActions = initialLogs.filter((l) => {
      const a = (l.action || '').toLowerCase();
      return a.includes('delete') || a.includes('status') || a.includes('role') || a.includes('archive');
    }).length;

    return {
      total: initialLogs.length,
      today: todayLogs.length,
      admins: uniqueAdmins,
      critical: criticalActions,
    };
  }, [initialLogs]);

  // Helper to format payload changes nicely
  const parsePayload = (data: any) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  // Helper to copy raw json
  const handleCopyRaw = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['ID,Timestamp,User,Role,Module,Action,Record_ID,IP_Address,Details'];
    const rows = filteredLogs.map((l) => {
      const cleanDetails = JSON.stringify(l.new_data_json || '')
        .replace(/"/g, '""')
        .replace(/\n/g, ' ');
      return `${l.id},"${new Date(l.created_at).toISOString()}","${l.user_name || 'System'}","${l.role_name || 'Super Admin'}","${l.module}","${l.action}",${l.record_id || ''},"${l.ip_address || ''}","${cleanDetails}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `corenix_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('delete') || a.includes('archive') || a.includes('remove')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }
    if (a.includes('create') || a.includes('add') || a.includes('insert')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (a.includes('toggle') || a.includes('status')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
  };

  const isFiltered = Boolean(
    searchQuery ||
    selectedUser !== 'all' ||
    selectedModule !== 'all' ||
    selectedAction !== 'all' ||
    dateFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedUser('all');
    setSelectedModule('all');
    setSelectedAction('all');
    setDateFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Super Admin Governance &amp; Security
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Enterprise Audit Trail &amp; Activity Log</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time immutable ledger of <strong>Who</strong> made changes, <strong>What</strong> was modified, in <strong>Which Module</strong>, and exact before &amp; after diffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recorded Events</span>
            <Activity className="w-4 h-4 text-sky-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable audit records
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Activity in Last 24h</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.today} Events
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Changes made today
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Operators</span>
            <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.admins} Staff Admins
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Across Head Office &amp; Branches
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">High-Impact Actions</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.critical}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Deletions, status toggles &amp; RBAC changes
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Admin Name, Role, Module, Action, Record #, or Payload..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto overflow-x-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === 'all'
                  ? 'bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === 'today'
                  ? 'bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === '7days'
                  ? 'bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* User Filter */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Staff &amp; Admins ({usersList.length})</option>
              {usersList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Modules ({modulesList.length})</option>
              {modulesList.map((m) => (
                <option key={m} value={m}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Action Types</option>
              <option value="create">Created / Added Items</option>
              <option value="edit">Updated / Modified Data</option>
              <option value="status">Status &amp; Promotion Toggles</option>
              <option value="delete">Archived / Deleted</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{logs.length}</strong> events
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No activity logs found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No changes matched your current filter criteria. Try resetting filters.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-bold text-xs"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-navy-950/40">
                  <th className="py-3.5 px-3">Timestamp</th>
                  <th className="py-3.5 px-3">Operator / Who</th>
                  <th className="py-3.5 px-3">Target Module &amp; ID</th>
                  <th className="py-3.5 px-3">Action / What</th>
                  <th className="py-3.5 px-3">Change Summary</th>
                  <th className="py-3.5 px-3 text-center">IP Address</th>
                  <th className="py-3.5 px-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.map((l) => {
                  const newParsed = parsePayload(l.new_data_json);
                  const newKeys = newParsed && typeof newParsed === 'object' ? Object.keys(newParsed) : [];

                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                          {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(l.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Operator / Who */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            {(l.user_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {l.user_name || 'System Administrator'}
                            </span>
                            <span className="text-[10px] font-semibold text-sky-600 dark:text-brand-400">
                              {l.role_name || 'Super Admin'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Module & Record */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {l.module}
                          </span>
                          {l.record_id ? (
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              #{l.record_id}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Action / What */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${getActionBadgeColor(l.action)}`}>
                          {l.action}
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-3 max-w-xs">
                        {newParsed && typeof newParsed === 'object' ? (
                          <div className="flex items-center gap-1 flex-wrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {newKeys.slice(0, 3).map((k) => (
                              <span key={k} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 truncate max-w-[140px]">
                                <span className="text-slate-400">{k}:</span> {String(newParsed[k])}
                              </span>
                            ))}
                            {newKeys.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-sans font-bold">
                                +{newKeys.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 truncate block">
                            {String(l.new_data_json || 'System modification')}
                          </span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {l.ip_address || '127.0.0.1'}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(l)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-brand-300 font-bold text-[11px] flex items-center gap-1 transition-colors mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Diff</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-brand-500/10 text-sky-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span>Audit Event #{inspectingLog.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeColor(inspectingLog.action)}`}>
                      {inspectingLog.action}
                    </span>
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Triggered by <strong>{inspectingLog.user_name || 'System'}</strong> ({inspectingLog.role_name || 'Super Admin'}) on {new Date(inspectingLog.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Diff Inspector */}
            <div className="space-y-4 py-4 overflow-y-auto flex-1 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Module</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inspectingLog.module}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Record ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">#{inspectingLog.record_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">IP Origin</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{inspectingLog.ip_address || '127.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operator ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">User #{inspectingLog.user_id || '1'}</span>
                </div>
              </div>

              {/* Data Diff Sections */}
              <div className="space-y-3">
                {inspectingLog.old_data_json && (
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <span>Previous State (Before Change)</span>
                    </span>
                    <pre className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {typeof inspectingLog.old_data_json === 'object'
                        ? JSON.stringify(inspectingLog.old_data_json, null, 2)
                        : inspectingLog.old_data_json}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span>Applied State (New Data &amp; Modifications)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRaw(parsePayload(inspectingLog.new_data_json))}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
                    >
                      {copiedRaw ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied JSON!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {typeof parsePayload(inspectingLog.new_data_json) === 'object'
                      ? JSON.stringify(parsePayload(inspectingLog.new_data_json), null, 2)
                      : String(inspectingLog.new_data_json || '{}')}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
