import { useState } from 'react';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7f2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">{children}</div>
            <Footer variant="app" className="mt-8" />
          </div>
        </main>
      </div>
    </div>
  );
}
