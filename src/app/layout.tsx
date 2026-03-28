import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compliance Automation | Admin Dashboard",
  description: "Automated compliance document tracking and follow-up system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Compliance Management</h1>
                <p className="text-slate-500">Welcome back, Admin</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white border text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  System Online
                </button>
              </div>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
