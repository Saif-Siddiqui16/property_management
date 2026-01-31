import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', amount: 8200 },
  { month: 'Feb', amount: 9100 },
  { month: 'Mar', amount: 10400 },
  { month: 'Apr', amount: 9800 },
  { month: 'May', amount: 11200 },
  { month: 'Jun', amount: 12050 },
];

import { useState, useEffect } from 'react';
import api from '../api/client';

import { OwnerSelector } from '../components/OwnerSelector';

export const RevenueDashboard = () => {
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    actualRevenue: 0,
    projectedRevenue: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    revenueByProperty: []
  });

  const fetchStats = async (ownerId = '') => {
    try {
      setLoading(true);
      const url = ownerId ? `/api/admin/analytics/revenue?ownerId=${ownerId}` : '/api/admin/analytics/revenue';
      const res = await api.get(url);
      setStats(res.data);
    } catch (e) {
      console.error('Revenue Fetch Error:', e);
      setStats({
        actualRevenue: 0,
        projectedRevenue: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        revenueByProperty: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedOwnerId);
  }, [selectedOwnerId]);

  return (
    <MainLayout title="Revenue Dashboard">
      <div className="flex flex-col gap-8">

        {/* TOP BAR / FILTERS */}
        <section className="flex justify-end sticky top-0 z-10 py-2 bg-slate-50/80 backdrop-blur-sm -mx-4 px-4">
          <OwnerSelector value={selectedOwnerId} onOwnerChange={(id) => setSelectedOwnerId(id)} />
        </section>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* TOP STATS */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
              <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-emerald-500">
                <span className="text-sm text-gray-500">Actual Revenue (Paid)</span>
                <h2 className="text-[2.1rem] font-bold mt-2 leading-tight">${(stats.actualRevenue || stats.totalRevenue || 0).toLocaleString('en-CA')}</h2>
                <p className="mt-2 text-gray-700">YTD Collected</p>
              </Card>

              <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-indigo-500">
                <span className="text-sm text-gray-500">Projected Revenue</span>
                <h2 className="text-[2.1rem] font-bold mt-2 leading-tight">${(stats.projectedRevenue || 0).toLocaleString('en-CA')}</h2>
                <p className="mt-2 text-gray-700">Active Lease Rent</p>
              </Card>
            </section>

            {/* CHARTS & BREAKDOWN */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6">
              {/* Monthly Revenue Chart */}
              <Card title="Revenue Trends (Monthly)" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.monthlyRevenue}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar
                      dataKey="amount"
                      radius={[6, 6, 0, 0]}
                      fill="#3b82f6"
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue by Property */}
              <Card title="Revenue by Property" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
                <ul className="p-0 list-none">
                  {stats.revenueByProperty.map((p, index) => (
                    <li key={index} className="flex justify-between py-2.5 border-b border-dashed border-gray-200 font-medium">
                      <span>{p.name}</span>
                      <strong>${p.amount.toLocaleString('en-CA')}</strong>
                    </li>
                  ))}
                  {stats.revenueByProperty.length === 0 && <li className="text-gray-400 italic">No revenue data for this owner</li>}
                </ul>
              </Card>
            </section>
          </>
        )}

      </div>
    </MainLayout>
  );
};
