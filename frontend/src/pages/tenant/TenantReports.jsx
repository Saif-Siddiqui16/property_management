import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TenantLayout } from '../../layouts/TenantLayout';
import api from '../../api/client';
import {
    FileText,
    CreditCard,
    Download,
    RefreshCw,
    Receipt,
    FileBarChart
} from 'lucide-react';
import { Button } from '../../components/Button';

const ICON_MAP = {
    payment_history: CreditCard,
    invoice_summary: Receipt
};
const COLOR_MAP = {
    payment_history: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    invoice_summary: { color: 'text-indigo-600', bg: 'bg-indigo-50' }
};

export const TenantReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/tenant/reports');
            const payload = res.data;
            const list = Array.isArray(payload?.reports) ? payload.reports : (Array.isArray(payload) ? payload : []);
            const mapped = list.map(r => ({
                ...r,
                id: r.id || r.type,
                icon: ICON_MAP[r.type] || FileBarChart,
                ...COLOR_MAP[r.type]
            }));
            setReports(mapped);
            setStats(payload?.stats || null);
        } catch (e) {
            console.error(e);
            setError(e.response?.data?.message || 'Failed to load reports.');
            setReports([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const statsRows = stats
        ? [
            { label: 'Reports Available', value: stats.reportsViewable ?? '—', sub: stats.reportsViewableSub ?? '' },
            { label: 'Paid (Total)', value: stats.paidAmount != null ? `$${Number(stats.paidAmount).toFixed(2)}` : '—', sub: `${stats.paidCount ?? 0} invoices` },
            { label: 'Outstanding', value: stats.outstandingAmount != null ? `$${Number(stats.outstandingAmount).toFixed(2)}` : '—', sub: stats.dataLatency ?? 'Real-time' }
        ]
        : [
            { label: 'Reports Available', value: '—', sub: '' },
            { label: 'Paid (Total)', value: '—', sub: '' },
            { label: 'Outstanding', value: '—', sub: '' }
        ];

    return (
        <TenantLayout title="My Reports">
            <div className="space-y-8 pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight italic uppercase">Account Reports</h3>
                        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Your invoice and payment history at a glance.</p>
                    </div>
                    <Button variant="secondary" onClick={fetchReports} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statsRows.map((s, i) => (
                        <div key={i} className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-lg font-black text-slate-800 italic">{s.value}</p>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw size={40} className="animate-spin text-slate-300" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No reports available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reports.map((report, idx) => (
                            <div key={report.id || idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col sm:flex-row gap-6">
                                <div className={`w-14 h-14 shrink-0 rounded-xl ${report.bg || 'bg-slate-50'} ${report.color || 'text-slate-600'} flex items-center justify-center mx-auto sm:mx-0`}>
                                    <report.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{report.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Last: {report.lastGenerated || '—'}</p>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => navigate(report.type === 'invoice_summary' ? '/tenant/invoices' : '/tenant/payments')}
                                        >
                                            <FileText size={14} /> View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 text-center text-slate-600 text-sm">
                    <p>For detailed invoices and payment history, use <strong>My Invoices</strong> and <strong>Pay Rent</strong> from the menu.</p>
                </div>
            </div>
        </TenantLayout>
    );
};
