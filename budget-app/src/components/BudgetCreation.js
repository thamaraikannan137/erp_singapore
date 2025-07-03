import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

const BudgetCreation = () => {
  const navigate = useNavigate();
  const { state, actions } = useBudget();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetData, setBudgetData] = useState({
    // Step 1: Budget Setup
    clientId: '',
    newClient: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      projectLocation: ''
    },
    project: {
      serviceType: '',
      projectScale: '',
      urgencyLevel: 'normal',
      startDate: '',
      duration: '',
      description: ''
    },
    
    // Step 2: Budget Type
    budgetType: '', // 'full-service', 'labour-tools', 'labour-only'
    
    // Step 3: Cost Calculator
    labour: {
      categories: [
        { categoryId: 'master', workers: 0, days: 0, hours: 8, rate: 200 },
        { categoryId: 'skilled', workers: 0, days: 0, hours: 8, rate: 150 },
        { categoryId: 'helper', workers: 0, days: 0, hours: 8, rate: 100 }
      ],
      overtimeRate: 1.5
    },
    materials: [],
    tools: [],
    
    // Step 4: Cost Breakdown
    items: [],
    profitMargin: 15,
    gstRate: 7
  });

  const [totals, setTotals] = useState({
    labour: 0,
    materials: 0,
    tools: 0,
    subtotal: 0,
    gst: 0,
    total: 0
  });

  // Budget type options
  const budgetTypes = [
    {
      id: 'full-service',
      title: 'Labour + Material + Tools',
      subtitle: 'Full Service',
      description: 'We provide everything - labour, materials, and tools',
      icon: '🔧'
    },
    {
      id: 'labour-tools',
      title: 'Labour + Tools',
      subtitle: 'Client Provides Materials',
      description: 'Client supplies materials, we provide labour and tools',
      icon: '👷'
    },
    {
      id: 'labour-only',
      title: 'Labour Only',
      subtitle: 'Hourly Wages',
      description: 'Hourly labour charges only',
      icon: '⏰'
    }
  ];

  // Calculate totals when items change
  const calculateTotals = useCallback(() => {
    let labourTotal = 0;
    let materialsTotal = 0;
    let toolsTotal = 0;

    // Calculate labour costs
    budgetData.labour.categories.forEach(cat => {
      labourTotal += cat.workers * cat.days * cat.hours * cat.rate;
    });

    // Calculate materials cost
    materialsTotal = budgetData.materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Calculate tools cost
    toolsTotal = budgetData.tools.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Calculate from items table
    const itemsTotal = budgetData.items.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0);

    const subtotal = labourTotal + materialsTotal + toolsTotal + itemsTotal;
    const gst = subtotal * (budgetData.gstRate / 100);
    const total = subtotal + gst;

    setTotals({
      labour: labourTotal,
      materials: materialsTotal,
      tools: toolsTotal,
      subtotal,
      gst,
      total
    });
  }, [budgetData]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveBudget = () => {
    let finalBudget = { ...budgetData, totals, status: 'draft' };
    
    // If a new client was created, save it first and get the client ID
    if (budgetData.clientId === 'new' && budgetData.newClient.name) {
      console.log('💾 Creating new client:', budgetData.newClient);
      
      // Create the new client
      const newClient = {
        name: budgetData.newClient.name,
        contactPerson: budgetData.newClient.contactPerson,
        email: budgetData.newClient.email,
        phone: budgetData.newClient.phone,
        address: budgetData.newClient.address,
        projects: []
      };
      
      // Add client to the system and get the returned client ID
      const clientId = actions.addClient(newClient);
      
      // Update the budget to use the actual client ID instead of 'new'
      finalBudget = {
        ...finalBudget,
        clientId: clientId,
        // Clear newClient since we now have a real client
        newClient: {}
      };
      
      console.log('✅ New client created with ID:', clientId);
    }
    
    console.log('💾 Saving Budget:', finalBudget);
    console.log('- Client ID:', finalBudget.clientId);
    console.log('- New Client:', finalBudget.newClient);
    console.log('- Project:', finalBudget.project);
    console.log('- Items:', finalBudget.items);
    console.log('- Totals:', finalBudget.totals);
    
    actions.addBudget(finalBudget);
    navigate('/budget/list');
  };

  const addItem = () => {
    setBudgetData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        description: '',
        category: 'Labour',
        quantity: 1,
        unit: 'Lump sum',
        unitRate: 0,
        notes: ''
      }]
    }));
  };

  const updateItem = (index, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
        
        {/* Client Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client
            </label>
            <select
              value={budgetData.clientId}
              onChange={(e) => setBudgetData(prev => ({ ...prev, clientId: e.target.value }))}
              className="input-field"
            >
              <option value="">Select existing client</option>
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.contactPerson}
                </option>
              ))}
              <option value="new">+ Add New Client</option>
            </select>
          </div>
        </div>

        {/* New Client Form */}
        {budgetData.clientId === 'new' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={budgetData.newClient.name}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, name: e.target.value }
                }))}
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
                value={budgetData.newClient.contactPerson}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, contactPerson: e.target.value }
                }))}
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
                value={budgetData.newClient.email}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, email: e.target.value }
                }))}
                className="input-field"
                placeholder="email@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={budgetData.newClient.phone}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, phone: e.target.value }
                }))}
                className="input-field"
                placeholder="+65 XXXX XXXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={budgetData.newClient.address}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, address: e.target.value }
                }))}
                className="input-field"
                rows="2"
                placeholder="Company address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Location
              </label>
              <textarea
                value={budgetData.newClient.projectLocation}
                onChange={(e) => setBudgetData(prev => ({
                  ...prev,
                  newClient: { ...prev.newClient, projectLocation: e.target.value }
                }))}
                className="input-field"
                rows="2"
                placeholder="Project location (if different from company address)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Project Classification */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Classification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <select
              value={budgetData.project.serviceType}
              onChange={(e) => setBudgetData(prev => ({
                ...prev,
                project: { ...prev.project, serviceType: e.target.value }
              }))}
              className="input-field"
            >
              <option value="">Select service type</option>
              {state.serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Scale *
            </label>
            <select
              value={budgetData.project.projectScale}
              onChange={(e) => setBudgetData(prev => ({
                ...prev,
                project: { ...prev.project, projectScale: e.target.value }
              }))}
              className="input-field"
            >
              <option value="">Select project scale</option>
              <option value="small">Small (Under $10,000)</option>
              <option value="medium">Medium ($10,000 - $50,000)</option>
              <option value="large">Large (Above $50,000)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={budgetData.project.urgencyLevel}
              onChange={(e) => setBudgetData(prev => ({
                ...prev,
                project: { ...prev.project, urgencyLevel: e.target.value }
              }))}
              className="input-field"
            >
              <option value="normal">Normal</option>
              <option value="rush">Rush (+20%)</option>
              <option value="emergency">Emergency (+50%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Start Date
            </label>
            <input
              type="date"
              value={budgetData.project.startDate}
              onChange={(e) => setBudgetData(prev => ({
                ...prev,
                project: { ...prev.project, startDate: e.target.value }
              }))}
              className="input-field"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description
            </label>
            <textarea
              value={budgetData.project.description}
              onChange={(e) => setBudgetData(prev => ({
                ...prev,
                project: { ...prev.project, description: e.target.value }
              }))}
              className="input-field"
              rows="3"
              placeholder="Describe the project requirements..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Type Selection</h3>
        <p className="text-gray-600 mb-6">Choose the type of service you'll be providing:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgetTypes.map(type => (
            <div
              key={type.id}
              className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                budgetData.budgetType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setBudgetData(prev => ({ ...prev, budgetType: type.id }))}
            >
              <div className="text-3xl mb-3">{type.icon}</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">{type.title}</h4>
              <p className="text-sm text-primary-600 font-medium mb-2">{type.subtitle}</p>
              <p className="text-sm text-gray-600">{type.description}</p>
              
              {budgetData.budgetType === type.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Dynamic Cost Calculator</h3>
        
        {/* Labour Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Labour Costs</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours/Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate/Hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetData.labour.categories.map((category, index) => {
                  const categoryInfo = state.labourCategories.find(c => c.id === category.categoryId);
                  const total = category.workers * category.days * category.hours * category.rate;
                  
                  return (
                    <tr key={category.categoryId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoryInfo?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={category.workers}
                          onChange={(e) => {
                            const newCategories = [...budgetData.labour.categories];
                            newCategories[index].workers = parseInt(e.target.value) || 0;
                            setBudgetData(prev => ({
                              ...prev,
                              labour: { ...prev.labour, categories: newCategories }
                            }));
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={category.days}
                          onChange={(e) => {
                            const newCategories = [...budgetData.labour.categories];
                            newCategories[index].days = parseInt(e.target.value) || 0;
                            setBudgetData(prev => ({
                              ...prev,
                              labour: { ...prev.labour, categories: newCategories }
                            }));
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={category.hours}
                          onChange={(e) => {
                            const newCategories = [...budgetData.labour.categories];
                            newCategories[index].hours = parseInt(e.target.value) || 8;
                            setBudgetData(prev => ({
                              ...prev,
                              labour: { ...prev.labour, categories: newCategories }
                            }));
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={category.rate}
                          onChange={(e) => {
                            const newCategories = [...budgetData.labour.categories];
                            newCategories[index].rate = parseFloat(e.target.value) || 0;
                            setBudgetData(prev => ({
                              ...prev,
                              labour: { ...prev.labour, categories: newCategories }
                            }));
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <span className="text-lg font-semibold">Labour Total: ${totals.labour.toFixed(2)}</span>
          </div>
        </div>

        {/* Materials Section (if full service or labour+tools) */}
        {(budgetData.budgetType === 'full-service') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Material Costs</h4>
              <button
                onClick={() => setBudgetData(prev => ({
                  ...prev,
                  materials: [...prev.materials, {
                    id: Date.now(),
                    category: '',
                    description: '',
                    quantity: 1,
                    unit: 'pcs',
                    unitPrice: 0,
                    supplier: '',
                    wastage: 5
                  }]
                }))}
                className="btn-primary text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Material
              </button>
            </div>
            
            {budgetData.materials.length > 0 && (
              <div className="space-y-3">
                {budgetData.materials.map((material, index) => (
                  <div key={material.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2">
                      <select
                        value={material.category}
                        onChange={(e) => {
                          const newMaterials = [...budgetData.materials];
                          newMaterials[index].category = e.target.value;
                          setBudgetData(prev => ({ ...prev, materials: newMaterials }));
                        }}
                        className="input-field text-sm"
                      >
                        <option value="">Category</option>
                        {state.materialCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={material.description}
                        onChange={(e) => {
                          const newMaterials = [...budgetData.materials];
                          newMaterials[index].description = e.target.value;
                          setBudgetData(prev => ({ ...prev, materials: newMaterials }));
                        }}
                        placeholder="Material description"
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => {
                          const newMaterials = [...budgetData.materials];
                          newMaterials[index].quantity = parseFloat(e.target.value) || 0;
                          setBudgetData(prev => ({ ...prev, materials: newMaterials }));
                        }}
                        placeholder="Qty"
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={material.unit}
                        onChange={(e) => {
                          const newMaterials = [...budgetData.materials];
                          newMaterials[index].unit = e.target.value;
                          setBudgetData(prev => ({ ...prev, materials: newMaterials }));
                        }}
                        placeholder="Unit"
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={material.unitPrice}
                        onChange={(e) => {
                          const newMaterials = [...budgetData.materials];
                          newMaterials[index].unitPrice = parseFloat(e.target.value) || 0;
                          setBudgetData(prev => ({ ...prev, materials: newMaterials }));
                        }}
                        placeholder="Unit Price"
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium">
                        ${(material.quantity * material.unitPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => {
                          setBudgetData(prev => ({
                            ...prev,
                            materials: prev.materials.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">Materials Total: ${totals.materials.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown Table</h3>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">Budget Items</h4>
            <button onClick={addItem} className="btn-primary text-sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item/Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetData.items.map((item, index) => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Enter description"
                        className="input-field text-sm"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="Labour">Labour</option>
                        <option value="Material">Material</option>
                        <option value="Tools">Tools</option>
                        <option value="Transport">Transport</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 input-field text-sm"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-20 input-field text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitRate}
                        onChange={(e) => updateItem(index, 'unitRate', parseFloat(e.target.value) || 0)}
                        className="w-32 input-field text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${(item.quantity * item.unitRate).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Budget Summary</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Labour Cost:</span>
              <span className="font-medium">${totals.labour.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Materials Cost:</span>
              <span className="font-medium">${totals.materials.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tools & Equipment:</span>
              <span className="font-medium">${totals.tools.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Items:</span>
              <span className="font-medium">
                ${budgetData.items.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0).toFixed(2)}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (7%):</span>
              <span className="font-medium">${totals.gst.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Budget Setup', component: renderStep1 },
    { number: 2, title: 'Budget Type', component: renderStep2 },
    { number: 3, title: 'Cost Calculator', component: renderStep3 },
    { number: 4, title: 'Cost Breakdown', component: renderStep4 }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRightIcon className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Step {currentStep}: {steps[currentStep - 1].title}
        </h2>
        {steps[currentStep - 1].component()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center px-4 py-2 rounded-lg font-medium ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-secondary'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-3">
          {currentStep === 4 ? (
            <button onClick={handleSaveBudget} className="btn-primary">
              Save Budget
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCreation; 