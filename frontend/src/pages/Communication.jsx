import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { communicationService } from '../services/communicationService';
import { Search, Send, User, MoreVertical, RefreshCw, Filter, Clock, MessageCircle } from 'lucide-react';
import api from '../api/client';

const Communication = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'OWNER' | 'TENANT' | 'AUDIT'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);
  const chatIntervalRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setRefreshing(true);
      const users = await communicationService.getConversations();
      setConversations(users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/communication');
      setAuditLogs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'AUDIT') {
      fetchAuditLogs();
      setSelectedUser(null);
    }
  }, [activeTab]);

  const getFilteredConversations = () => {
    if (activeTab === 'AUDIT') return [];
    let filtered = conversations;
    if (activeTab !== 'ALL') {
      if (activeTab === 'RESIDENT') {
        filtered = filtered.filter(u => u.role === 'RESIDENT' || u.isResident);
      } else {
        filtered = filtered.filter(u => u.role === activeTab && !u.isResident);
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const displayedUsers = getFilteredConversations();
  const usersWithNewMessages = displayedUsers.filter(u => (u.unreadCount || 0) > 0);
  const newMessageFromNames = usersWithNewMessages.map(u => u.name || u.email || 'Someone').join(', ');

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setLoading(true);
    const numericId = typeof user.id === 'string' && user.id.startsWith('resident_') ? parseInt(user.id.replace('resident_', ''), 10) : user.id;
    if (!isNaN(numericId)) {
      try {
        await communicationService.markAsRead(numericId);
        await fetchConversations();
      } catch (_) {}
    }
    await fetchHistory(user.id);
    setLoading(false);
  };

  const fetchHistory = async (userId) => {
    try {
      const history = await communicationService.getHistory(userId);
      setMessages(history);
      scrollToBottom();
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      await communicationService.sendMessage(selectedUser.id, newMessage);
      setNewMessage('');
      fetchHistory(selectedUser.id);
    } catch (error) { console.error(error); }
    finally { setSending(false); }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <MainLayout title="Communication Hub">
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* LEFT: SIDEBAR */}
        <div className="w-[340px] border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 bg-white border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">History</h2>
              <button onClick={fetchConversations} className={`p-2 rounded-full hover:bg-slate-100 ${refreshing ? 'animate-spin' : ''}`}>
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-hide">
              {['ALL', 'TENANT', 'OWNER', 'RESIDENT', 'AUDIT'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[60px] py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {tab === 'AUDIT' ? 'Audit Trail' : tab}
                </button>
              ))}
            </div>

            {activeTab !== 'AUDIT' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search contact..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {activeTab !== 'AUDIT' && usersWithNewMessages.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <MessageCircle className="flex-shrink-0 text-amber-600" size={18} />
                <p className="text-xs font-semibold text-amber-800">
                  New message{usersWithNewMessages.length > 1 ? 's' : ''} from: <span className="font-bold">{newMessageFromNames}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'AUDIT' ? (
              <div className="p-4 text-center text-slate-400 space-y-2 mt-10 px-8">
                <Clock size={32} className="mx-auto opacity-20" />
                <p className="text-sm font-bold">Audit Trail Mode</p>
                <p className="text-[11px]">Monitoring all outgoing automated system notifications.</p>
              </div>
            ) : displayedUsers.map(user => {
              const hasNew = (user.unreadCount || 0) > 0;
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-50 hover:bg-white group ${selectedUser?.id === user.id ? 'bg-white border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'} ${hasNew ? 'bg-amber-50/70' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${hasNew ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' : 'bg-indigo-50 text-indigo-600'}`}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    {hasNew && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white px-1">
                        {user.unreadCount > 99 ? '99+' : user.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${hasNew ? 'text-amber-900' : 'text-slate-700'}`}>
                      {user.name || user.email}
                      {hasNew && <span className="ml-1 text-[10px] font-black text-amber-600 uppercase">(new)</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{user.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CONTENT */}
        <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
          {activeTab === 'AUDIT' ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Outgoing Communication Audit</h3>
                {loading ? <div className="p-20 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={48} /></div> : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                          <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-xs font-medium text-slate-500">{log.date}</td>
                            <td className="p-4 text-sm font-bold text-slate-700">{log.recipient}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">
                                {log.eventType}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-400">{log.channel}</td>
                            <td className="p-4 text-right">
                              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.status === 'Sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : !selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <User size={64} className="opacity-10 mb-4" />
              <p className="font-bold">Select a user to chat</p>
            </div>
          ) : (
            <>
              <div className="h-[73px] px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedUser.name || selectedUser.email}</h3>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Online</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-100'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                  <button type="submit" disabled={sending} className="h-12 w-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Communication;
