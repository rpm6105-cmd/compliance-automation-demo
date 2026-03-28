import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  History, 
  ShieldCheck,
  Bell,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Documents', icon: FileText, href: '/documents' },
  { name: 'Activity Logs', icon: History, href: '/logs' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">CompAuto</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:text-blue-400" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-all">
          <Bell className="w-5 h-5" />
          <span className="font-medium">Notifications</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/20 hover:text-red-400 cursor-pointer transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </div>
      </div>
    </aside>
  );
}
