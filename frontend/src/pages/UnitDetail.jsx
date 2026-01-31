import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Edit2, Loader2, FileText, Download } from 'lucide-react';
import api from '../api/client';

export const UnitDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [unit, setUnit] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) fetchUnitDetails();
    }, [id]);

    const fetchUnitDetails = async () => {
        try {
            const response = await api.get(`/api/admin/units/${id}`);
            setUnit(response.data);

            // Fetch linked documents
            const docsRes = await api.get('/api/admin/documents');
            const linkedDocs = docsRes.data.filter(d => d.unitId === parseInt(id));
            setDocuments(linkedDocs);
        } catch (error) {
            console.error('Error fetching unit:', error);
            setError('Failed to load unit details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title="Unit Details">
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <span className="ml-3 text-slate-500">Loading unit details...</span>
                </div>
            </MainLayout>
        );
    }

    if (error || !unit) {
        return (
            <MainLayout title="Unit Details">
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-red-500 mb-4">{error || 'Unit not found'}</p>
                    <Button variant="secondary" onClick={() => navigate('/units')}>
                        <ArrowLeft size={16} />
                        Back to Units
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={`Unit ${unit.unitNumber}`}>
            <div className="flex flex-col gap-6">
                {/* Back Button */}
                <div>
                    <Button variant="secondary" onClick={() => navigate('/units')}>
                        <ArrowLeft size={16} />
                        Back to Units
                    </Button>
                </div>

                {/* Top Info Section - Excel Fields */}
                <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Unit Number</div>
                        <div className="text-lg font-bold text-slate-800">{unit.unitNumber}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Unit Type</div>
                        <div className="text-lg font-bold text-slate-800">{unit.unitType || '-'}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Civic Number</div>
                        <div className="text-lg font-bold text-indigo-600">{unit.civicNumber || unit.building}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Floor</div>
                        <div className="text-lg font-bold text-slate-800">{unit.floor || '-'}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Bedrooms</div>
                        <div className="text-lg font-bold text-slate-800">{unit.bedrooms || 1}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
                        <div className={`text-lg font-bold ${unit.status === 'Occupied' ? 'text-green-600' : 'text-red-600'}`}>
                            {unit.status}
                        </div>
                    </Card>
                </section>

                {/* Actions */}
                <section className="flex gap-4 items-center py-4 border-b border-dashed border-slate-200">
                    <Button variant="primary" onClick={() => navigate(`/units`)}>
                        <Edit2 size={16} />
                        Edit Unit
                    </Button>
                </section>

                {/* Detail Sections */}
                <section className="grid grid-cols-1 gap-6">
                    {/* Documents section as the primary focus */}
                    <Card title={`Linked Documents (${documents.length})`} className="min-h-[300px]">
                        <p className="text-slate-500 text-sm mb-6 -mt-2">
                            Access all files and documents linked specifically to this unit.
                        </p>
                        {documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all hover:shadow-md group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{doc.name}</span>
                                                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                                                    {doc.type} • {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`${api.defaults.baseURL}/api/admin/documents/${doc.id}/download`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-none hover:shadow-sm"
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <FileText size={32} />
                                </div>
                                <p className="text-slate-400 italic">No documents currently linked to this unit.</p>
                                <p className="text-slate-300 text-xs mt-1">Upload documents via the Document Library to see them here.</p>
                            </div>
                        )}
                    </Card>
                </section>

            </div>
        </MainLayout>
    );
};
