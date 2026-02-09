import React, { useState, useEffect } from 'react';
import { User, Menu } from 'lucide-react';
import api from '../../api/client';

export const OwnerTopbar = ({ title, onMenuClick }) => {
    const [ownerName, setOwnerName] = useState('Loading...');
    const [ownerInitials, setOwnerInitials] = useState('...');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/owner/profile');
                if (res.data.name) {
                    setOwnerName(res.data.name);
                    const initials = res.data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    setOwnerInitials(initials);
                }
            } catch (err) {
                console.error("Failed to fetch owner profile", err);
                setOwnerName('Owner');
                setOwnerInitials('OW');
            }
        };
        fetchProfile();
    }, []);

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="flex flex-col">
                    <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight italic uppercase truncate max-w-[150px] md:max-w-none">{title}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] hidden xs:block">Live Portfolio View</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 md:gap-4 md:border-l md:border-slate-100 md:pl-6">
                    <div className="flex items-center gap-3 md:pl-2 group cursor-default">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-800 italic">{ownerName}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-slate-200 shrink-0">
                            {ownerInitials}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
