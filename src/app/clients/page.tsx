'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Mail, Phone, MoreVertical, Trash2, Edit2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ company_name: '', contact_person: '', email: '', phone: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (!error) setClients(data || []);
    setLoading(false);
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('clients').insert([newClient]).select();
    if (!error) {
      setClients([data[0], ...clients]);
      setIsModalOpen(false);
      setNewClient({ company_name: '', contact_person: '', email: '', phone: '' });
      // Log Activity
      await supabase.from('activity_logs').insert([{ action: `Added client: ${newClient.company_name}` }]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 px-4 border-r border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Clients</p>
          <p className="text-xl font-bold">{clients.length}</p>
        </div>
        <div className="flex-1 px-4 border-r border-slate-100 font-medium">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active This Month</p>
          <p className="text-xl font-bold">{clients.length}</p>
        </div>
        <div className="flex-1 px-4">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">New (Last 7d)</p>
          <p className="text-xl font-bold">2</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No clients found. Click "Add Client" to begin.</td></tr>
            ) : clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-900">{client.company_name}</p>
                    <p className="text-xs text-slate-400">ID: {client.id.slice(0, 8)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-slate-700">{client.contact_person}</p>
                    <div className="flex items-center gap-3 text-slate-400 mt-1">
                      <Mail className="w-3 h-3" /> <span className="text-xs">{client.email}</span>
                      <Phone className="w-3 h-3 ml-1" /> <span className="text-xs">{client.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Integration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6">Register New Client</h3>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={e => setNewClient({...newClient, company_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Contact Person</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                      onChange={e => setNewClient({...newClient, contact_person: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="+91 0000 0000" 
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                      onChange={e => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="admin@company.com" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
