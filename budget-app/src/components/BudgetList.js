import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const BudgetList = () => {
  const { state, actions } = useBudget();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Filter budgets
  const filteredBudgets = state.budgets.filter(budget => {
    const client = state.clients.find(c => c.id === budget.clientId);
    const matchesSearch = 
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.project?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.project?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesService = serviceFilter === 'all' || budget.project?.serviceType === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const handleDeleteBudget = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      actions.deleteBudget(budgetId);
    }
  };

  const handleGenerateQuotation = (budget) => {
    console.log('🔗 Generating quotation for budget:', budget);
    console.log('- Budget ID:', budget.id);
    console.log('- Budget has items:', budget.items?.length || 0);
    console.log('- Budget client info:', budget.clientId ? 'Existing client' : 'New client');
    navigate(`/quotation/generate/${budget.id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Manage all your project budgets and generate quotations</p>
        </div>
        <Link to="/budget/create" className="btn-primary flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Budget
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, service type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          {/* Service Filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Services</option>
              {state.serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredBudgets.length} of {state.budgets.length} budgets
        </div>
        <div className="flex items-center space-x-4">
          <span>Total Value: ${state.budgets.reduce((sum, budget) => sum + (budget.totals?.total || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Budget List */}
      {filteredBudgets.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client & Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgets.map((budget) => {
                  const client = state.clients.find(c => c.id === budget.clientId);
                  return (
                    <tr key={budget.id} className="table-row-hover">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client?.name || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client?.contactPerson}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {budget.project?.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {budget.project?.serviceType || 'Not specified'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {budget.project?.projectScale}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${budget.totals?.total?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          GST: ${budget.totals?.gst?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(budget.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(budget.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleGenerateQuotation(budget)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                            title="Generate Quotation"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/budget/create?edit=${budget.id}`)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="Edit Budget"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Budget"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <FunnelIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first budget.'}
            </p>
            <Link to="/budget/create" className="btn-primary">
              Create Budget
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Budgets</div>
          <div className="text-2xl font-bold text-gray-900">{state.budgets.length}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Draft Budgets</div>
          <div className="text-2xl font-bold text-yellow-600">
            {state.budgets.filter(b => b.status === 'draft').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Approved Budgets</div>
          <div className="text-2xl font-bold text-green-600">
            {state.budgets.filter(b => b.status === 'approved').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-primary-600">
            ${state.budgets.reduce((sum, budget) => sum + (budget.totals?.total || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetList; 