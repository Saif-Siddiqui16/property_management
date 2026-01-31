import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/Button';
import { BedDouble, Calendar, DollarSign, Home, User, Shield, ChevronDown, CheckCircle, Bed } from 'lucide-react';

export const LeaseFormBedroom = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [units, setUnits] = useState([]);
    const [bedrooms, setBedrooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [form, setForm] = useState({
        unitId: '',
        bedroomId: '',
        tenantId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: ''
    });

    useEffect(() => {
        fetchBuildings();
        fetchTenants();
    }, []);

    const fetchBuildings = async () => {
        try {
            const res = await api.get('/api/admin/properties');
            setBuildings(res.data);
        } catch (error) {
            console.error('Failed to fetch buildings', error);
        }
    };

    const fetchTenants = async () => {
        try {
            const res = await api.get('/api/admin/tenants');
            // Show tenants who don't have active leases
            const filtered = res.data.filter(t =>
                t.leaseStatus !== 'Active'
            );
            setTenants(filtered);
        } catch (error) {
            console.error('Failed to fetch tenants', error);
        }
    };

    const handleBuildingChange = async (e) => {
        const buildingId = e.target.value;
        setSelectedBuilding(buildingId);
        setUnits([]);
        setBedrooms([]);
        setForm({
            ...form,
            unitId: '',
            bedroomId: '',
            tenantId: '',
        });

        if (buildingId) {
            try {
                // Fetch units for this building
                const res = await api.get(`/api/admin/units?propertyId=${buildingId}&limit=1000`);
                const allUnits = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

                // Simplified filtering for Bedroom-wise Lease:
                const filteredUnits = allUnits.filter(u => {
                    // Hide if explicitly Fully Booked
                    if (u.status === 'Fully Booked') return false;

                    // Hide if Occupied in FULL_UNIT mode
                    if ((u.rentalMode === 'FULL_UNIT' || !u.rentalMode) && u.status === 'Occupied') return false;

                    return true;
                });
                setUnits(filteredUnits);
            } catch (error) {
                console.error('Failed to fetch units', error);
            }
        }
    };

    const handleUnitChange = async (e) => {
        const unitId = e.target.value;
        setForm({ ...form, unitId, bedroomId: '', tenantId: '' });
        setBedrooms([]);

        if (unitId) {
            try {
                // Fetch vacant bedrooms for this specific unit
                const res = await api.get(`/api/admin/units/bedrooms/vacant?unitId=${unitId}`);
                setBedrooms(res.data);
            } catch (error) {
                console.error('Failed to fetch bedrooms', error);
            }
        }
    };

    const handleSave = async () => {
        if (!form.unitId || !form.bedroomId || !form.tenantId || !form.startDate || !form.endDate) {
            alert('Please fill all required fields (Unit, Bedroom, Tenant, Dates)');
            return;
        }

        try {
            const payload = {
                ...form,
                unitId: parseInt(form.unitId),
                bedroomId: parseInt(form.bedroomId),
                tenantId: parseInt(form.tenantId),
                monthlyRent: parseFloat(form.monthlyRent) || 0,
                securityDeposit: parseFloat(form.securityDeposit) || 0
            };
            const res = await api.post('/api/admin/leases', payload);

            let msg = 'Bedroom Lease created successfully.';
            if (res.data.notifications) {
                const { status, sms, email, message } = res.data.notifications;
                if (status === 'Sent') {
                    msg += `\n\nCredentials sent via: ${sms ? 'SMS ' : ''}${email ? 'Email' : ''}`;
                } else if (status === 'Skipped') {
                    msg += `\n\nOnboarding: ${message}`;
                } else if (status === 'Failed') {
                    msg += '\n\nFailed to send credentials (check SMS/Email settings)';
                }
            }

            alert(msg);
            navigate('/leases');
        } catch (error) {
            console.error('Failed to create lease', error);
            alert(error.response?.data?.message || 'Error creating lease');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <MainLayout title="Bedroom Lease">
            <div className="max-w-3xl mx-auto py-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-500 fade-in border border-slate-100">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <BedDouble size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 m-0">New Bedroom Lease</h2>
                            <p className="text-slate-500 text-sm mt-1">Create a lease for an individual bedroom</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Building Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">BUILDING NAME</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={selectedBuilding}
                                    onChange={handleBuildingChange}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none"
                                >
                                    <option value="">Choose a Building</option>
                                    {buildings.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} - {b.civicNumber}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Unit Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Unit</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="unitId"
                                    value={form.unitId}
                                    onChange={handleUnitChange}
                                    disabled={!selectedBuilding}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Unit</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.unitNumber || u.unit_identifier || u.name} ({u.status})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Bedroom Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Bedroom</label>
                            <div className="relative">
                                <Bed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="bedroomId"
                                    value={form.bedroomId}
                                    onChange={handleChange}
                                    disabled={!form.unitId}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Bedroom</option>
                                    {bedrooms.map(b => (
                                        <option key={b.id} value={b.id}>{b.bedroomNumber}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Tenant Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Tenant</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="tenantId"
                                    value={form.tenantId}
                                    onChange={handleChange}
                                    disabled={!form.bedroomId}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                            {form.tenantId && tenants.find(t => t.id.toString() === form.tenantId.toString())?.type === 'RESIDENT' && (
                                <p className="text-xs font-semibold text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2 w-fit">
                                    <Shield size={14} />
                                    Resident of: {tenants.find(t => t.id.toString() === form.tenantId.toString())?.parentName || 'Unknown Parent'}
                                </p>
                            )}
                        </div>

                        {/* Financials */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Monthly Rent ($)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="monthlyRent"
                                    placeholder="0.00"
                                    type="number"
                                    value={form.monthlyRent}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Security Deposit ($)</label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="securityDeposit"
                                    placeholder="0.00"
                                    type="number"
                                    value={form.securityDeposit}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Start Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">End Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => navigate('/leases')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="min-w-[140px] shadow-lg shadow-indigo-200">
                            <CheckCircle size={18} />
                            Save Lease
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
