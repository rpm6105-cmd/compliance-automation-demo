'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  Send,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const DOC_TYPES = ['PF', 'ESI', 'Joint Declaration', 'Other'];

export default function DocumentsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{show: boolean, msg: string} | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  async function fetchData() {
    setLoading(true);
    const { data: clientsData } = await supabase.from('clients').select('*');
    const { data: docsData } = await supabase.from('documents').select('*').eq('month', selectedMonth);
    
    setClients(clientsData || []);
    setDocuments(docsData || []);
    setLoading(false);
  }

  const getDocStatus = (clientId: string, type: string) => {
    return documents.find(d => d.client_id === clientId && d.document_type === type);
  };

  async function handleFileUpload(clientId: string, type: string) {
    setUploadingId(`${clientId}-${type}`);
    
    // Simulate network delay for better UX
    await new Promise(r => setTimeout(r, 800));

    // Generate a Dummy URL for Demo
    const fileUrl = `https://supabase-storage-mock.com/uploads/${clientId}_${type}.pdf`;
    
    const { data, error } = await supabase.from('documents').upsert({
      client_id: clientId,
      month: selectedMonth,
      document_type: type,
      status: 'received',
      file_url: fileUrl
    }).select();

    if (!error) {
      setDocuments([...documents, data[0]]);
      setNotification({ show: true, msg: `Successfully uploaded ${type} for ${selectedMonth}` });
      
      await supabase.from('activity_logs').insert([{ 
        client_id: clientId, 
        action: `Uploaded ${type} for ${selectedMonth}` 
      }]);

      // Auto-hide notification
      setTimeout(() => setNotification(null), 3000);
    }
    setUploadingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Tracking</h2>
          <p className="text-slate-500 text-sm">Monitoring monthly compliance across all clients</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border rounded-lg px-4 py-2 text-sm font-semibold outline-none"
          />
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <Send className="w-4 h-4" />
            Bulk Follow-up
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs w-64">Client Name</th>
                {DOC_TYPES.map(type => (
                  <th key={type} className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-center">{type}</th>
                ))}
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{client.company_name}</p>
                    <p className="text-xs text-slate-400">Monthly Tracker</p>
                  </td>
                  {DOC_TYPES.map(type => {
                    const doc = getDocStatus(client.id, type);
                    return (
                      <td key={type} className="px-6 py-4 text-center">
                        {doc?.status === 'received' ? (
                          <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase border border-green-100 animate-in zoom-in duration-300">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Received
                          </div>
                        ) : doc?.status === 'overdue' ? (
                          <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase border border-red-100">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Overdue
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleFileUpload(client.id, type)}
                            disabled={uploadingId === `${client.id}-${type}`}
                            className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all cursor-pointer group-hover:scale-105 disabled:opacity-50"
                          >
                            {uploadingId === `${client.id}-${type}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileUp className="w-3.5 h-3.5" />
                            )}
                            {uploadingId === `${client.id}-${type}` ? 'Uploading...' : 'Upload'}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-300 hover:text-slate-600">
                      <ChevronRight className="w-5 h-5 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {notification?.show && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300 z-[100] border border-slate-700/50">
          <div className="bg-green-500 p-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
