import React from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6 text-gray-500" />
          </button>
          
          {/* Page title */}
          <h1 className="text-xl font-semibold text-gray-900">
            ERP Budget Management System
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Current date/time */}
          <div className="hidden md:block text-sm text-gray-500">
            {new Date().toLocaleDateString('en-SG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">Islam Norul</div>
              <div className="text-xs text-gray-500">Project Manager</div>
            </div>
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 