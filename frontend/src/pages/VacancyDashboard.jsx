import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';

import { useState, useEffect } from 'react';
import api from '../api/client';

import { OwnerSelector } from '../components/OwnerSelector';

export const VacancyDashboard = () => {
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    vacant: 0,
    occupied: 0,
    vacancyByBuilding: []
  });

  const fetchStats = async (ownerId = '') => {
    try {
      setLoading(true);
      const url = ownerId ? `/api/admin/analytics/vacancy?ownerId=${ownerId}` : '/api/admin/analytics/vacancy';
      const res = await api.get(url);
      setStats(res.data);
    } catch (e) {
      console.error('Vacancy Fetch Error:', e);
      setStats({
        total: 0,
        vacant: 0,
        occupied: 0,
        vacancyByBuilding: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedOwnerId);
  }, [selectedOwnerId]);

  return (
    <MainLayout title="Vacancy Dashboard">
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
              <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1">
                <span className="text-sm text-gray-500">Total Units</span>
                <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.total}</h2>
                <p className="mt-2 text-gray-700">Across all buildings</p>
              </Card>

              <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-red-500">
                <span className="text-sm text-gray-500">Vacant Units</span>
                <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.vacant}</h2>
                <p className="mt-2 text-gray-700">Needs attention</p>
              </Card>

              <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-emerald-500">
                <span className="text-sm text-gray-500">Occupied Units</span>
                <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.occupied}</h2>
                <p className="mt-2 text-gray-700">Generating revenue</p>
              </Card>
            </section>

            {/* DETAILS */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
              {/* Vacancy by Building */}
              <Card title="Vacancy by Building" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
                <ul className="p-0 list-none">
                  {stats.vacancyByBuilding.map((b, index) => (
                    <li key={index} className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span>{b.name}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.vacant > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                        {b.vacant > 0 ? `${b.vacant} Vacant` : 'Fully Occupied'}
                      </span>
                    </li>
                  ))}
                  {stats.vacancyByBuilding.length === 0 && <li className="text-gray-400 italic">No buildings for this owner</li>}
                </ul>
              </Card>

              {/* Unit vs Bedroom Mode */}
              <Card title="Unit vs Bedroom Rental Mode" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 p-5 rounded-xl text-center transition-transform duration-300 hover:scale-105 bg-blue-50">
                    <h4 className="font-semibold text-slate-900">Full Unit Rental</h4>
                    <p className="text-slate-600">{stats.total} Units</p>
                  </div>
                </div>
              </Card>
            </section>
          </>
        )}

      </div>
    </MainLayout>
  );
};
