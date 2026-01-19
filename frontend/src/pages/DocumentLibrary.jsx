import React, { useState, useEffect } from "react";
import { MainLayout } from "../layouts/MainLayout";
import {
    FileText,
    Search,
    Download,
    Trash2,
    Filter,
    ExternalLink,
    Building,
    User,
    Clock,
    Shield,
    FileMinus
} from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import api from "../api/client";

export const DocumentLibrary = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/admin/documents");
            setDocuments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/documents/${id}`);
            fetchDocuments();
        } catch (error) {
            alert("Delete failed");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
            doc.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            doc.user?.lastName?.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "All" || doc.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'Insurance': return <Shield className="text-emerald-500" size={20} />;
            case 'Lease': return <FileText className="text-indigo-500" size={20} />;
            case 'Invoice': return <FileText className="text-amber-500" size={20} />;
            default: return <FileText className="text-slate-400" size={20} />;
        }
    };

    return (
        <MainLayout title="Document Library">
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* STATS / HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-slate-500 font-medium">Access and manage all system-wide documents and tenant uploads.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <FileText className="text-indigo-600" size={20} />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Files</p>
                                <p className="text-lg font-black text-slate-800 leading-none">{documents.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <Card className="p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by filename or tenant..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-5 py-3.5 rounded-[18px] border border-slate-200 outline-none focus:border-indigo-500 font-medium text-slate-700 bg-slate-50 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-3.5 rounded-[18px] border border-slate-200 bg-white font-bold text-slate-600 text-sm">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="outline-none bg-transparent cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                <option value="Lease">Leases</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Invoice">Invoices</option>
                            </select>
                        </div>
                        <Button
                            variant="secondary"
                            className="h-14 px-6 rounded-[18px]"
                            onClick={() => { setSearch(""); setTypeFilter("All"); }}
                        >
                            Reset
                        </Button>
                    </div>
                </Card>

                {/* GRID VIEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[32px] animate-pulse"></div>)
                    ) : filteredDocuments.length > 0 ? (
                        filteredDocuments.map(doc => (
                            <Card key={doc.id} className="group p-6 rounded-[32px] hover:shadow-2xl transition-all duration-300 border border-slate-100 bg-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    {getIcon(doc.type)}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 line-clamp-1 tracking-tight" title={doc.name}>{doc.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-widest">{doc.type}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 space-y-2">
                                        {doc.user && (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <User size={14} className="text-slate-300" />
                                                <span className="text-xs font-bold">{doc.user.firstName} {doc.user.lastName}</span>
                                            </div>
                                        )}
                                        {doc.property && (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Building size={14} className="text-slate-300" />
                                                <span className="text-xs font-bold">{doc.property.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 w-full text-xs font-black h-12 rounded-xl border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 group/btn"
                                            onClick={() => {
                                                const fileUrl = doc.fileUrl.startsWith('http')
                                                    ? doc.fileUrl
                                                    : `${api.defaults.baseURL.replace('/api', '')}${doc.fileUrl}`;
                                                window.open(fileUrl, '_blank');
                                            }}
                                        >
                                            <ExternalLink size={14} className="mr-2 group-hover/btn:scale-110" />
                                            Open
                                        </Button>

                                        <Button
                                            variant="primary"
                                            className="flex-1 w-full text-xs font-black h-12 rounded-xl shadow-lg shadow-indigo-100"
                                            onClick={async () => {
                                                try {
                                                    const fileUrl = doc.fileUrl.startsWith('http')
                                                        ? doc.fileUrl
                                                        : `${api.defaults.baseURL.replace('/api', '')}${doc.fileUrl}`;

                                                    const response = await fetch(fileUrl);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = doc.name; // Use the doc name
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (err) {
                                                    console.error("Download failed", err);
                                                    alert("Failed to download file");
                                                }
                                            }}
                                        >
                                            <Download size={14} className="mr-2" />
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto text-slate-200">
                                <FileMinus size={48} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 font-bold text-xl">No documents found matching your filters.</p>
                                <p className="text-slate-400/60 font-medium">Try resetting filters or searching for something else.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};
