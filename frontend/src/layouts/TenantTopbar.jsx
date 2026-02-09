import React, { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import api from '../api/client';

export const TenantTopbar = ({ title = 'Dashboard', onMenuClick }) => {
    const [tenantName, setTenantName] = useState('Tenant');
    const [buildingInfo, setBuildingInfo] = useState('Loading...');
    const [initials, setInitials] = useState('...');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/tenant/profile');
                if (res.data.name) {
                    setTenantName(res.data.name);
                    const inits = res.data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    setInitials(inits);
                }

                const bName = res.data.buildingName || 'No Building';
                const uNum = res.data.unitNumber || '';
                setBuildingInfo(uNum ? `${bName} – ${uNum}` : bName);
            } catch (err) {
                console.error("Failed to fetch tenant profile", err);
                setTenantName('Tenant');
                setInitials('TN');
                setBuildingInfo('');
            }
        };
        fetchProfile();
    }, []);

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 lg:px-6">
            <div className="flex items-center gap-4">
                <button
                    className="block lg:hidden text-slate-600 p-2"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">{tenantName}</span>
                    <span className="text-xs text-slate-500 font-medium">{buildingInfo}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};
