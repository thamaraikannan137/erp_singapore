import React from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import {
  PlusCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { state } = useBudget();

  // Calculate statistics
  const totalBudgets = state.budgets.length;
  const totalClients = state.clients.length;
  const totalValue = state.budgets.reduce((sum, budget) => sum + (budget.totals?.total || 0), 0);
  const draftBudgets = state.budgets.filter(b => b.status === 'draft').length;

  const statsCards = [
    {
      title: 'Total Budgets',
      value: totalBudgets,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Clients',
      value: totalClients,
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      change: '+28%',
      changeType: 'increase'
    },
    {
      title: 'Draft Budgets',
      value: draftBudgets,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      change: '+3%',
      changeType: 'increase'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Budget',
      description: 'Start a new budget for a client project',
      icon: PlusCircleIcon,
      href: '/budget/create',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'Generate Quotation',
      description: 'Convert approved budget to quotation',
      icon: DocumentTextIcon,
      href: '/quotation/generate',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Manage Clients',
      description: 'Add or update client information',
      icon: UsersIcon,
      href: '/clients',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, Islam Norul! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your budget management today.
            </p>
          </div>
          <div className="text-right">
            <div className="text-primary-100 text-sm">Today</div>
            <div className="text-xl font-semibold">
              {new Date().toLocaleDateString('en-SG', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center transition-colors duration-200`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-primary-600">
                  {action.title}
                </h3>
              </div>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Budgets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Budgets</h3>
            <Link to="/budget/list" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {state.budgets.length > 0 ? (
            <div className="space-y-3">
              {state.budgets.slice(0, 5).map((budget) => {
                const client = state.clients.find(c => c.id === budget.clientId);
                return (
                  <div key={budget.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {client?.name || 'Unknown Client'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {budget.project?.serviceType || 'Service Type'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${budget.totals?.total?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(budget.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No budgets created yet</p>
              <Link to="/budget/create" className="text-primary-600 hover:text-primary-700 text-sm">
                Create your first budget
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Follow up with client</div>
                  <div className="text-xs text-gray-500">Church of St Alphonsus</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Prepare quotation</div>
                  <div className="text-xs text-gray-500">Granite repair project</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Tomorrow</div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Site visit scheduled</div>
                  <div className="text-xs text-gray-500">New client project</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Next week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Monthly Performance</h3>
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Performance chart coming soon</p>
            <p className="text-sm text-gray-400">Budget trends and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 