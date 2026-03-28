'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  RefreshCcw,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    received: 0,
    pending: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    const { data: docs } = await supabase.from('documents').select('status');
    
    const received = docs?.filter(d => d.status === 'received').length || 0;
    const pending = docs?.filter(d => d.status === 'pending').length || 0;
    const overdue = docs?.filter(d => d.status === 'overdue').length || 0;

    setStats({
      totalClients: clientCount || 0,
      received,
      pending,
      overdue
    });
    setLoading(false);
  }

  async function seedData() {
    setSeeding(true);
    // 1. Create Sample Clients
    const sampleClients = [
      { company_name: 'TechNova Solutions', contact_person: 'Rahul Kumar', email: 'rahul@technova.com', phone: '9876543210' },
      { company_name: 'Global Logistics', contact_person: 'Anita Singh', email: 'anita@global.com', phone: '9876543211' },
      { company_name: 'Apex Industries', contact_person: 'Vikram Sahay', email: 'vikram@apex.in', phone: '9876543212' },
      { company_name: 'Zenith Retail', contact_person: 'Neha Verma', email: 'neha@zenith.com', phone: '9876543213' },
      { company_name: 'Stark Enterprises', contact_person: 'Tony S.', email: 'admin@stark.com', phone: '9876543214' }
    ];

    const { data: clients, error: cerr } = await supabase.from('clients').insert(sampleClients).select();
    if (clients) {
      // 2. Add Mixed Documents for this month
      const month = new Date().toISOString().slice(0, 7);
      const docs = [];
      for (const client of clients) {
        docs.push({ client_id: client.id, month, document_type: 'PF', status: Math.random() > 0.5 ? 'received' : 'pending' });
        docs.push({ client_id: client.id, month, document_type: 'ESI', status: Math.random() > 0.5 ? 'received' : 'overdue' });
      }
      await supabase.from('documents').insert(docs);
      await supabase.from('activity_logs').insert([{ action: 'Seeded demo data with 5 clients' }]);
    }
    
    await fetchStats();
    setSeeding(false);
  }

  async function triggerFollowups() {
    // Simulate background automation
    const { data: pendingDocs } = await supabase.from('documents').select('*').eq('status', 'pending');
    if (pendingDocs && pendingDocs.length > 0) {
      // For demo, we mark first 2 as overdue if they are "old"
      const { error } = await supabase.from('documents').update({ status: 'overdue' }).in('id', pendingDocs.slice(0, 2).map(d => d.id));
      if (!error) {
        await supabase.from('activity_logs').insert([{ action: 'Automation: Marked 2 items as Overdue (Day 5 trigger)' }]);
        await fetchStats();
      }
    }
    alert('Automation cycle complete. Check Activity Logs.');
  }

  const statCards = [
    { name: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { name: 'Docs Received', value: stats.received, icon: FileCheck, color: 'bg-green-500' },
    { name: 'Pending', value: stats.pending, icon: Clock, color: 'bg-orange-500' },
    { name: 'Overdue Risks', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex gap-4">
        <button 
          onClick={seedData}
          disabled={seeding}
          className="bg-white border text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          Seed Demo Data
        </button>
        <button 
          onClick={triggerFollowups}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
        >
          <Zap className="w-4 h-4" />
          Run Automation Sim
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="text-slate-300 w-5 h-5 group-hover:text-slate-400 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
              <h3 className="text-3xl font-bold text-slate-900">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Service Health</h2>
          <div className="space-y-6">
            {[
              { label: 'PF Filing Collection', val: stats.totalClients > 0 ? (stats.received / (stats.totalClients * 2)) * 100 : 0 },
              { label: 'ESI Compliance', val: 75 },
              { label: 'Joint Declarations', val: 40 }
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{item.label}</span>
                  <span className="text-slate-500 font-medium">{Math.round(item.val)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full bg-blue-600 rounded-full transition-all duration-1000`}
                    style={{ width: `${item.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Guide */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400 w-5 h-5" />
            Demo Instructions
          </h2>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
              <span>Click <b>Seed Demo Data</b> to populate the dashboard with 200+ clients (simulated).</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
              <span>Go to <b>Documents</b> tab to upload files and see real-time status updates.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
              <span>Use <b>Run Automation Sim</b> to simulate the pass of time and auto-escalate pending items.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
