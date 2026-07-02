import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmployerSidebar from '@/components/layout/EmployerSidebar';

export default function EmployerDashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <EmployerSidebar />
        <div className="flex-1 min-w-0 bg-surface border border-border rounded-xl p-6 shadow-xs">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
