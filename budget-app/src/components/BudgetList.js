import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const BudgetList = () => {
  const { state, actions } = useBudget();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
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

  const handleViewBudget = (budget) => {
    setSelectedBudget(budget);
    setShowViewModal(true);
  };

  const handleEditBudget = (budget) => {
    // Navigate to edit the existing budget directly
    navigate(`/budget/create?edit=${budget.id}`);
  };

  const handleCreateRevision = (budget) => {
    // Create a new revision of the budget using the context action
    actions.createRevision(budget.id, budget);
    
    // Get the newly created revision and navigate to edit it
    const newRevision = actions.getLatestRevision(budget);
    if (newRevision) {
      navigate(`/budget/create?edit=${newRevision.id}`);
    }
  };

  const handleViewRevisionHistory = (budget) => {
    setSelectedBudget(budget);
    setShowViewModal(true);
  };

  const getRevisionHistory = (budget) => {
    return actions.getRevisionHistory(budget);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft', icon: ClockIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircleIcon },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending', icon: ClockIcon }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getRevisionBadge = (budget) => {
    if (budget.isRevision) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <ArrowPathIcon className="w-3 h-3 mr-1" />
          Rev {budget.revisionNumber}
        </span>
      );
    }
    return null;
  };

  // View Budget Modal
  const ViewBudgetModal = () => {
    if (!selectedBudget) return null;
    
    const client = state.clients.find(c => c.id === selectedBudget.clientId);
    const revisionHistory = getRevisionHistory(selectedBudget);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Budget Details</h2>
              <div className="flex items-center space-x-2">
                {getRevisionBadge(selectedBudget)}
                {getStatusBadge(selectedBudget.status)}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Client Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Company:</span>
                  <p className="text-gray-900">{client?.name || 'Unknown Client'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Contact Person:</span>
                  <p className="text-gray-900">{client?.contactPerson}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{client?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{client?.phone}</p>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Service Type:</span>
                  <p className="text-gray-900">{selectedBudget.project?.serviceType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Project Scale:</span>
                  <p className="text-gray-900">{selectedBudget.project?.projectScale}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Urgency Level:</span>
                  <p className="text-gray-900">{selectedBudget.project?.urgencyLevel}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Expected Start Date:</span>
                  <p className="text-gray-900">{selectedBudget.project?.expectedStartDate}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700">Project Description:</span>
                <p className="text-gray-900 mt-1">{selectedBudget.project?.projectDescription}</p>
              </div>
            </div>

            {/* Cost Breakdown */}
            {selectedBudget.sections && selectedBudget.sections.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cost Breakdown</h3>
                {selectedBudget.sections.map((section, index) => (
                  <div key={section.id} className="mb-4 last:mb-0">
                    <h4 className="font-medium text-gray-800 mb-2">{section.name}</h4>
                    {section.description && (
                      <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                    )}
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Section Total: ${section.total || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">${selectedBudget.totals?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">GST (7%):</span>
                  <span className="font-medium">${selectedBudget.totals?.gst?.toFixed(2) || '0.00'}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">${selectedBudget.totals?.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Revision History */}
            {revisionHistory.length > 1 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Revision History</h3>
                <div className="space-y-2">
                  {revisionHistory.map((revision, index) => (
                    <div key={revision.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">
                          {revision.isRevision ? `Revision ${revision.revisionNumber}` : 'Original'}
                        </span>
                        {getStatusBadge(revision.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(revision.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Created: {new Date(selectedBudget.createdAt).toLocaleDateString()}
                {selectedBudget.updatedAt !== selectedBudget.createdAt && (
                  <span className="ml-4">
                    Updated: {new Date(selectedBudget.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditBudget(selectedBudget)}
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Create Revision
                </button>
                <button
                  onClick={() => handleGenerateQuotation(selectedBudget)}
                  className="btn-primary flex items-center"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Generate Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Manage all your project budgets and track revisions</p>
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
                    Status & Revision
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
                  const revisionHistory = getRevisionHistory(budget);
                  const hasRevisions = revisionHistory.length > 1;
                  
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
                        <div className="space-y-1">
                          {getStatusBadge(budget.status)}
                          {getRevisionBadge(budget)}
                          {hasRevisions && (
                            <button
                              onClick={() => handleViewRevisionHistory(budget)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              {revisionHistory.length} revisions
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(budget.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewBudget(budget)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Budget"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleGenerateQuotation(budget)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                            title="Generate Quotation"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="Edit Budget"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateRevision(budget)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Create Revision"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
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

      {/* View Budget Modal */}
      {showViewModal && <ViewBudgetModal />}
    </div>
  );
};

export default BudgetList; 