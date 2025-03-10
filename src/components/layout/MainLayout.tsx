
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Settings, Home, BarChart2 } from 'lucide-react';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Mail className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">Air Travel Claim QC</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-gray-100">
            <Home className="mr-3 h-5 w-5 text-gray-500" />
            Dashboard
          </Link>
          <Link to="/validate" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <CheckCircle className="mr-3 h-5 w-5 text-gray-500" />
            Email QC Check
          </Link>
          <Link to="/history" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <AlertCircle className="mr-3 h-5 w-5 text-gray-500" />
            QC History
          </Link>
          <Link to="/analytics" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <BarChart2 className="mr-3 h-5 w-5 text-gray-500" />
            Analytics
          </Link>
          <Link to="/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
            <Settings className="mr-3 h-5 w-5 text-gray-500" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white w-full fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <Mail className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">Air Travel Claim QC</span>
        </div>
        <nav className="flex space-x-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/validate" className="text-gray-500 hover:text-gray-900">
            <CheckCircle className="h-6 w-6" />
          </Link>
          <Link to="/history" className="text-gray-500 hover:text-gray-900">
            <AlertCircle className="h-6 w-6" />
          </Link>
          <Link to="/settings" className="text-gray-500 hover:text-gray-900">
            <Settings className="h-6 w-6" />
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:p-8 p-4 md:pt-8 pt-20 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
