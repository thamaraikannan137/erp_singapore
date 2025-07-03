import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ClientManagement = () => {
  const { state, actions } = useBudget();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Filter clients
  const filteredClients = state.clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = (clientId) => {
    // Check if client has associated budgets
    const hasbudgets = state.budgets.some(budget => budget.clientId === clientId);
    
    if (hasbudgets) {
      alert('Cannot delete client. This client has associated budgets.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this client?')) {
      actions.deleteClient(clientId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingClient) {
      actions.updateClient({ ...editingClient, ...formData });
    } else {
      actions.addClient(formData);
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const getClientBudgetStats = (clientId) => {
    const clientBudgets = state.budgets.filter(budget => budget.clientId === clientId);
    const totalValue = clientBudgets.reduce((sum, budget) => sum + (budget.totals?.total || 0), 0);
    
    return {
      count: clientBudgets.length,
      totalValue
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage your client database and contact information</p>
        </div>
        <button onClick={handleAddClient} className="btn-primary flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredClients.length} of {state.clients.length} clients
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const stats = getClientBudgetStats(client.id);
            return (
              <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Client Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.contactPerson}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      title="Edit Client"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded"
                      title="Delete Client"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`mailto:${client.email}`} className="hover:text-primary-600">
                        {client.email}
                      </a>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`tel:${client.phone}`} className="hover:text-primary-600">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="break-words">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
                      <div className="text-xs text-gray-500">Budgets</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">
                        ${stats.totalValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total Value</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first client.'}
            </p>
            <button onClick={handleAddClient} className="btn-primary">
              Add Client
            </button>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingClient ? 'Edit Client' : 'Add New Client'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                        className="input-field"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field"
                        placeholder="email@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field"
                        placeholder="+65 XXXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="input-field"
                        rows="3"
                        placeholder="Company address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="input-field"
                        rows="2"
                        placeholder="Additional notes about the client"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement; 