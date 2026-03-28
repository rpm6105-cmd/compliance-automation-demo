'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, Activity, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (!error) setLogs(data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          <p className="text-slate-500 text-sm">A chronological audit trail of all system actions</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-white border p-2 rounded-lg hover:bg-slate-50 transition"
        >
          <Activity className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
          {loading ? (
            <p className="text-center text-slate-400 italic">Reading event logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-slate-400 italic">No activity recorded yet.</p>
          ) : logs.map((log) => (
            <div key={log.id} className="relative flex items-center gap-6 group">
              <div className="absolute left-0 w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center -ml-px group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div className="ml-12 flex-1 pb-8 border-b border-slate-50 group-last:border-none">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{log.action}</p>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-3 h-3" />
                  <span className="text-xs">System Admin</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
