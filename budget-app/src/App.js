import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BudgetCreation from './components/BudgetCreation';
import BudgetList from './components/BudgetList';
import QuotationGeneration from './components/QuotationGeneration';
import ClientManagement from './components/ClientManagement';

// Context
import { BudgetProvider } from './context/BudgetContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BudgetProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              setSidebarOpen={setSidebarOpen} 
            />
            
            {/* Page content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-6 py-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/budget/create" element={<BudgetCreation />} />
                  <Route path="/budget/list" element={<BudgetList />} />
                  <Route path="/quotation/generate/:budgetId?" element={<QuotationGeneration />} />
                  <Route path="/clients" element={<ClientManagement />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </BudgetProvider>
  );
}

export default App; 