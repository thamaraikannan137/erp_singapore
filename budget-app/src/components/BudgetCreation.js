import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, UserIcon, BuildingOfficeIcon, DocumentTextIcon, WrenchScrewdriverIcon, TruckIcon, ClockIcon, PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useBudget } from '../context/BudgetContext';
import { useLocation, useNavigate } from 'react-router-dom';

const steps = [
  { title: 'Client Information' },
  { title: 'Budget Type' },
  { title: 'Cost Breakdown' },
  { title: 'Budget Summary' },
];

const initialClientFields = {
  companyName: '',
  clientName: '',
  clientEmail: '',
  phoneNumber: '',
  telephoneNumber: '',
  address: '',
  projectLocation: '',
};
const initialProjectFields = {
  serviceType: '',
  projectScale: '',
  urgencyLevel: '',
  expectedStartDate: '',
  projectDescription: '',
};

const budgetTypeOptions = [
  {
    id: 'full-service',
    title: 'Labour + Material + Tools',
    subtitle: 'Full Service',
    description: 'We provide everything - labour, materials, and tools. Complete turnkey solution.',
    icon: WrenchScrewdriverIcon,
    color: 'blue',
    features: ['Complete labour services', 'All materials included', 'Tools & equipment provided', 'Full project management']
  },
  {
    id: 'labour-tools',
    title: 'Labour + Tools',
    subtitle: 'Client Provides Materials',
    description: 'Client supplies materials, we provide labour and tools. You control material quality.',
    icon: TruckIcon,
    color: 'green',
    features: ['Professional labour', 'Tools & equipment included', 'You supply materials', 'Quality control on materials']
  },
  {
    id: 'labour-only',
    title: 'Labour Only',
    subtitle: 'Hourly Wages',
    description: 'Hourly labour charges only. You provide all materials and tools.',
    icon: ClockIcon,
    color: 'purple',
    features: ['Skilled labour only', 'Hourly rates', 'You provide materials', 'You provide tools']
  }
];

const BudgetCreation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { state, actions } = useBudget();
  const location = useLocation();
  const navigate = useNavigate();

  // Step 1 state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClient, setNewClient] = useState(initialClientFields);
  const [existingClient, setExistingClient] = useState(initialClientFields);
  const [project, setProject] = useState(initialProjectFields);

  // Step 2 state
  const [selectedBudgetType, setSelectedBudgetType] = useState('');

  // Step 3 state
  const [sections, setSections] = useState([
    {
      id: 1,
      name: 'Section 1',
      description: '',
      images: [],
      materials: [],
      tools: [],
      labour: []
    }
  ]);

  // Image upload handlers
  const handleImageUpload = (sectionId, files) => {
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, images: [...section.images, ...newImages] }
        : section
    ));
  };

  const removeImage = (sectionId, imageId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, images: section.images.filter(img => img.id !== imageId) }
        : section
    ));
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Helper functions for Step 3
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      name: `Section ${sections.length + 1}`,
      description: '',
      images: [],
      materials: [],
      tools: [],
      labour: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const addItem = (sectionId, category) => {
    const newItem = {
      id: Date.now(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: category === 'labour' ? 'hours' : 'units'
    };

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, [category]: [...section[category], newItem] }
        : section
    ));
  };

  const removeItem = (sectionId, category, itemId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, [category]: section[category].filter(item => item.id !== itemId) }
        : section
    ));
  };

  const updateItem = (sectionId, category, itemId, field, value) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            [category]: section[category].map(item => 
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : section
    ));
  };

  const calculateSectionTotal = (section) => {
    const materialsTotal = section.materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const toolsTotal = section.tools.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const labourTotal = section.labour.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return materialsTotal + toolsTotal + labourTotal;
  };

  const calculateProjectTotal = () => {
    return sections.reduce((sum, section) => sum + calculateSectionTotal(section), 0);
  };

  // Update existingClient when selectedClientId changes
  useEffect(() => {
    if (selectedClientId && selectedClientId !== 'new') {
      const client = state.clients.find(c => c.id === selectedClientId);
      if (client) {
        setExistingClient({
          name: client.name || '',
          clientName: client.clientName || '',
          clientEmail: client.email || '',
          phoneNumber: client.phone || '',
          telephoneNumber: client.telephoneNumber || '',
          address: client.address || '',
          projectLocation: client.projectLocation || ''
        });
      }
    }
  }, [selectedClientId, state.clients]);

  // Load existing budget data for editing
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editBudgetId = searchParams.get('edit');
    
    if (editBudgetId) {
      const existingBudget = state.budgets.find(b => b.id === editBudgetId);
      if (existingBudget) {
        // Load client data
        if (existingBudget.clientId) {
          setSelectedClientId(existingBudget.clientId);
        } else if (existingBudget.newClient) {
          setSelectedClientId('new');
          setNewClient(existingBudget.newClient);
        }
        
        // Load project data
        if (existingBudget.project) {
          setProject(existingBudget.project);
        }
        
        // Load budget type
        if (existingBudget.budgetType) {
          setSelectedBudgetType(existingBudget.budgetType);
        }
        
        // Load sections data
        if (existingBudget.sections && existingBudget.sections.length > 0) {
          setSections(existingBudget.sections);
        }
      }
    }
  }, [location.search, state.budgets]);

  // Step 1: Client Info & Project Classification
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Client Selection Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center mb-4">
          <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Client
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
          >
            <option value="">Choose an existing client</option>
            {state.clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.contactPerson}
              </option>
            ))}
            <option value="new" className="font-semibold">➕ Add New Client</option>
          </select>
        </div>

        {/* New Client Form */}
        {selectedClientId === 'new' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-600 mr-2" />
              New Client Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={newClient.companyName} 
                  onChange={e => setNewClient(c => ({ ...c, companyName: e.target.value }))} 
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={newClient.clientName} 
                  onChange={e => setNewClient(c => ({ ...c, clientName: e.target.value }))} 
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={newClient.clientEmail} 
                  onChange={e => setNewClient(c => ({ ...c, clientEmail: e.target.value }))} 
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={newClient.phoneNumber} 
                  onChange={e => setNewClient(c => ({ ...c, phoneNumber: e.target.value }))} 
                  placeholder="+65 XXXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone Number
                </label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={newClient.telephoneNumber} 
                  onChange={e => setNewClient(c => ({ ...c, telephoneNumber: e.target.value }))} 
                  placeholder="Office telephone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  rows={2} 
                  value={newClient.address} 
                  onChange={e => setNewClient(c => ({ ...c, address: e.target.value }))} 
                  placeholder="Enter company address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Location
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  rows={2} 
                  value={newClient.projectLocation} 
                  onChange={e => setNewClient(c => ({ ...c, projectLocation: e.target.value }))} 
                  placeholder="Project location (if different from company address)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Existing Client Details */}
        {selectedClientId && selectedClientId !== 'new' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 text-gray-600 mr-2" />
              Edit Client Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={existingClient.name}
                  onChange={e => setExistingClient(c => ({ ...c, name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={existingClient.clientName || existingClient.contactPerson}
                  onChange={e => setExistingClient(c => ({ ...c, clientName: e.target.value, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={existingClient.clientEmail || existingClient.email}
                  onChange={e => setExistingClient(c => ({ ...c, clientEmail: e.target.value, email: e.target.value }))}
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={existingClient.phoneNumber || existingClient.phone}
                  onChange={e => setExistingClient(c => ({ ...c, phoneNumber: e.target.value, phone: e.target.value }))}
                  placeholder="+65 XXXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={existingClient.telephoneNumber}
                  onChange={e => setExistingClient(c => ({ ...c, telephoneNumber: e.target.value }))}
                  placeholder="Office telephone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  rows={2}
                  value={existingClient.address}
                  onChange={e => setExistingClient(c => ({ ...c, address: e.target.value }))}
                  placeholder="Enter company address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Location
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  rows={2}
                  value={existingClient.projectLocation}
                  onChange={e => setExistingClient(c => ({ ...c, projectLocation: e.target.value }))}
                  placeholder="Project location (if different from company address)"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Classification Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center mb-6">
          <DocumentTextIcon className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Project Classification</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
              value={project.serviceType} 
              onChange={e => setProject(p => ({ ...p, serviceType: e.target.value }))}
            >
              <option value="">Select service type</option>
              {state.serviceTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Scale <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
              value={project.projectScale} 
              onChange={e => setProject(p => ({ ...p, projectScale: e.target.value }))}
            >
              <option value="">Select project scale</option>
              <option value="small">Small (Under $10,000)</option>
              <option value="medium">Medium ($10,000 - $50,000)</option>
              <option value="large">Large (Above $50,000)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
              value={project.urgencyLevel} 
              onChange={e => setProject(p => ({ ...p, urgencyLevel: e.target.value }))}
            >
              <option value="">Select urgency level</option>
              <option value="normal">Normal</option>
              <option value="rush">Rush (+20%)</option>
              <option value="emergency">Emergency (+50%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Start Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
              value={project.expectedStartDate} 
              onChange={e => setProject(p => ({ ...p, expectedStartDate: e.target.value }))} 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
              rows={4} 
              value={project.projectDescription} 
              onChange={e => setProject(p => ({ ...p, projectDescription: e.target.value }))} 
              placeholder="Describe the project requirements, scope, and any specific details..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Budget Type Selection
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Budget Type</h3>
        <p className="text-gray-600">Select the service level that best fits your project requirements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {budgetTypeOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedBudgetType === option.id;
          
          return (
            <div
              key={option.id}
              onClick={() => setSelectedBudgetType(option.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isSelected && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${option.color}-500 rounded-full flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${option.color}-100 mb-4`}>
                  <IconComponent className={`w-8 h-8 text-${option.color}-600`} />
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h4>
                <p className={`text-sm font-medium text-${option.color}-600 mb-3`}>{option.subtitle}</p>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                
                <ul className="text-left space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <svg className={`w-4 h-4 text-${option.color}-500 mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBudgetType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {budgetTypeOptions.find(opt => opt.id === selectedBudgetType)?.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Cost Breakdown
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cost Breakdown by Sections</h3>
        <p className="text-gray-600">Break down your project into sections and add detailed cost items</p>
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={section.name}
                onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Section Name"
              />
              {sections.length > 1 && (
                <button
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Section Total</p>
              <p className="text-xl font-bold text-gray-900">${calculateSectionTotal(section).toFixed(2)}</p>
            </div>
          </div>

          {/* Section Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Description</label>
            <textarea
              value={section.description}
              onChange={(e) => updateSection(section.id, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              rows={3}
              placeholder="Describe this section of work..."
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Images</label>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(section.id, e.target.files)}
                className="hidden"
                id={`image-upload-${section.id}`}
              />
              <label htmlFor={`image-upload-${section.id}`} className="cursor-pointer">
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>

            {/* Image Preview */}
            {section.images.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images ({section.images.length})</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {section.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => removeImage(section.id, image.id)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
                          title="Remove image"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost Categories */}
          <div className="space-y-6">
            {/* Materials Section - Only show if full-service selected */}
            {selectedBudgetType === 'full-service' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Materials</h4>
                  <button
                    onClick={() => addItem(section.id, 'materials')}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Material
                  </button>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-100 rounded-md mb-3 text-sm font-medium text-gray-700">
                  <div className="col-span-3">Item Selection</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-1">Subtotal</div>
                  <div className="col-span-1">Action</div>
                </div>
                
                {section.materials.length > 0 && (
                  <div className="space-y-3">
                    {section.materials.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-md">
                        <div className="col-span-3">
                          <select
                            value={item.name}
                            onChange={(e) => updateItem(section.id, 'materials', item.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select from DB OR Add New</option>
                            <option value="Pipes & Fittings">Pipes & Fittings</option>
                            <option value="Paint & Coatings">Paint & Coatings</option>
                            <option value="Aluminum Profiles">Aluminum Profiles</option>
                            <option value="Granite & Stone">Granite & Stone</option>
                            <option value="Hardware & Tools">Hardware & Tools</option>
                            <option value="Safety Equipment">Safety Equipment</option>
                            <option value="Other Materials">Other Materials</option>
                            <option value="custom">+ Add New Material</option>
                          </select>
                          {item.name === 'custom' && (
                            <input
                              type="text"
                              value={item.customName || ''}
                              onChange={(e) => updateItem(section.id, 'materials', item.id, 'customName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1 focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter new material name"
                            />
                          )}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(section.id, 'materials', item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Material details"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(section.id, 'materials', item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter qty"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(section.id, 'materials', item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Price per unit"
                          />
                        </div>
                        <div className="col-span-1 text-sm font-medium">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeItem(section.id, 'materials', item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-right mt-3">
                  <span className="text-sm text-gray-600">Materials Subtotal: </span>
                  <span className="font-semibold">
                    ${section.materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Tools Section - Show if labour-tools or full-service selected */}
            {(selectedBudgetType === 'labour-tools' || selectedBudgetType === 'full-service') && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Tools & Equipment</h4>
                  <button
                    onClick={() => addItem(section.id, 'tools')}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Tool
                  </button>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-100 rounded-md mb-3 text-sm font-medium text-gray-700">
                  <div className="col-span-3">Item Selection</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-1">Subtotal</div>
                  <div className="col-span-1">Action</div>
                </div>
                
                {section.tools.length > 0 && (
                  <div className="space-y-3">
                    {section.tools.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-md">
                        <div className="col-span-3">
                          <select
                            value={item.name}
                            onChange={(e) => updateItem(section.id, 'tools', item.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          >
                            <option value="">Select from DB OR Add New</option>
                            <option value="Power Tools">Power Tools</option>
                            <option value="Hand Tools">Hand Tools</option>
                            <option value="Safety Equipment">Safety Equipment</option>
                            <option value="Measuring Tools">Measuring Tools</option>
                            <option value="Ladders & Scaffolding">Ladders & Scaffolding</option>
                            <option value="Cleaning Equipment">Cleaning Equipment</option>
                            <option value="Other Tools">Other Tools</option>
                            <option value="custom">+ Add New Tool</option>
                          </select>
                          {item.name === 'custom' && (
                            <input
                              type="text"
                              value={item.customName || ''}
                              onChange={(e) => updateItem(section.id, 'tools', item.id, 'customName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1 focus:ring-1 focus:ring-green-500"
                              placeholder="Enter new tool name"
                            />
                          )}
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(section.id, 'tools', item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                            placeholder="Tool/Equipment details"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(section.id, 'tools', item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                            placeholder="Enter qty"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(section.id, 'tools', item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                            placeholder="Price per unit"
                          />
                        </div>
                        <div className="col-span-1 text-sm font-medium">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeItem(section.id, 'tools', item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-right mt-3">
                  <span className="text-sm text-gray-600">Tools Subtotal: </span>
                  <span className="font-semibold">
                    ${section.tools.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Labour Section - Always visible */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Labour</h4>
                <button
                  onClick={() => addItem(section.id, 'labour')}
                  className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Labour
                </button>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-100 rounded-md mb-3 text-sm font-medium text-gray-700">
                <div className="col-span-3">Item Selection</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-1">Subtotal</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {section.labour.length > 0 && (
                <div className="space-y-3">
                  {section.labour.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-md">
                      <div className="col-span-3">
                        <select
                          value={item.name}
                          onChange={(e) => updateItem(section.id, 'labour', item.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="">Select from DB OR Add New</option>
                          <option value="Master Craftsman">Master Craftsman</option>
                          <option value="Skilled Worker">Skilled Worker</option>
                          <option value="Helper">Helper</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Specialist">Specialist</option>
                          <option value="Other Labour">Other Labour</option>
                          <option value="custom">+ Add New Labour Type</option>
                        </select>
                        {item.name === 'custom' && (
                          <input
                            type="text"
                            value={item.customName || ''}
                            onChange={(e) => updateItem(section.id, 'labour', item.id, 'customName', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1 focus:ring-1 focus:ring-purple-500"
                            placeholder="Enter new labour type"
                          />
                        )}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(section.id, 'labour', item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          placeholder="Labor type details"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(section.id, 'labour', item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          placeholder="Enter hours"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(section.id, 'labour', item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          placeholder="Rate per hour"
                        />
                      </div>
                      <div className="col-span-1 text-sm font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeItem(section.id, 'labour', item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-right mt-3">
                <span className="text-sm text-gray-600">Labour Subtotal: </span>
                <span className="font-semibold">
                  ${section.labour.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Section Button */}
      <div className="text-center">
        <button
          onClick={addSection}
          className="flex items-center mx-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Section
        </button>
      </div>

      {/* Project Total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Project Total</h4>
          <p className="text-3xl font-bold text-blue-600">${calculateProjectTotal().toFixed(2)}</p>
        </div>
      </div>
    </div>
  );

  // Step 4: Budget Summary
  const renderStep4 = () => {
    const selectedClient = selectedClientId === 'new' ? newClient : state.clients.find(c => c.id === selectedClientId);
    const selectedBudgetTypeInfo = budgetTypeOptions.find(opt => opt.id === selectedBudgetType);
    const projectTotal = calculateProjectTotal();
    const gst = projectTotal * 0.07; // 7% GST for Singapore
    const finalTotal = projectTotal + gst;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Budget Summary</h3>
          <p className="text-gray-600">Review your project budget before finalizing</p>
        </div>

        {/* Client Information Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
            Client Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Company Name:</span>
                <p className="text-gray-900">{selectedClient?.companyName || selectedClient?.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contact Person:</span>
                <p className="text-gray-900">{selectedClient?.clientName || selectedClient?.contactPerson}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{selectedClient?.clientEmail || selectedClient?.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{selectedClient?.phoneNumber || selectedClient?.phone}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-900">{selectedClient?.address}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Project Location:</span>
                <p className="text-gray-900">{selectedClient?.projectLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 text-green-600 mr-3" />
            Project Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Service Type:</span>
                <p className="text-gray-900">{project.serviceType}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Project Scale:</span>
                <p className="text-gray-900">{project.projectScale}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Urgency Level:</span>
                <p className="text-gray-900">{project.urgencyLevel}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Expected Start Date:</span>
                <p className="text-gray-900">{project.expectedStartDate}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Budget Type:</span>
                <p className="text-gray-900">{selectedBudgetTypeInfo?.title}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-medium text-gray-700">Project Description:</span>
            <p className="text-gray-900 mt-1">{project.projectDescription}</p>
          </div>
        </div>

        {/* Cost Breakdown Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-6">Cost Breakdown by Sections</h4>
          
          {sections.map((section, index) => (
            <div key={section.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold text-gray-800">{section.name}</h5>
                <span className="text-lg font-bold text-blue-600">${calculateSectionTotal(section).toFixed(2)}</span>
              </div>
              
              {section.description && (
                <p className="text-gray-600 mb-3">{section.description}</p>
              )}

              {/* Section Images */}
              {section.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Section Images ({section.images.length})</p>
                  <div className="flex space-x-2 overflow-x-auto">
                    {section.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Categories Summary */}
              <div className="space-y-3">
                {selectedBudgetType === 'full-service' && section.materials.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Materials:</span>
                    <span className="font-medium">${section.materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</span>
                  </div>
                )}
                
                {(selectedBudgetType === 'labour-tools' || selectedBudgetType === 'full-service') && section.tools.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tools & Equipment:</span>
                    <span className="font-medium">${section.tools.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</span>
                  </div>
                )}
                
                {section.labour.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labour:</span>
                    <span className="font-medium">${section.labour.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Cost Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Final Cost Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Project Subtotal:</span>
              <span className="font-semibold">${projectTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">GST (7%):</span>
              <span className="font-semibold">${gst.toFixed(2)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-2xl font-bold text-purple-600">
              <span>Total Amount:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h4>
          <div className="space-y-3 text-sm text-gray-700">
            <p>• This budget is valid for 30 days from the date of creation.</p>
            <p>• All prices are subject to change based on material availability and market conditions.</p>
            <p>• Payment terms: 50% advance payment required before project commencement.</p>
            <p>• Project timeline will be confirmed upon budget approval.</p>
            <p>• Any additional work not included in this budget will be quoted separately.</p>
            <p>• Warranty covers workmanship for 12 months from project completion.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={() => {
              const searchParams = new URLSearchParams(location.search);
              const editBudgetId = searchParams.get('edit');
              
              const budgetData = {
                clientId: selectedClientId !== 'new' ? selectedClientId : undefined,
                newClient: selectedClientId === 'new' ? newClient : undefined,
                project,
                budgetType: selectedBudgetType,
                sections,
                totals: {
                  subtotal: calculateProjectTotal(),
                  gst: calculateProjectTotal() * 0.07,
                  total: calculateProjectTotal() * 1.07
                },
                status: 'draft',
                updatedAt: new Date().toISOString()
              };

              if (editBudgetId) {
                // Update existing budget
                budgetData.id = editBudgetId;
                budgetData.createdAt = state.budgets.find(b => b.id === editBudgetId)?.createdAt || new Date().toISOString();
                actions.updateBudget(budgetData);
                alert('Budget updated successfully!');
              } else {
                // Create new budget
                budgetData.createdAt = new Date().toISOString();
                actions.addBudget(budgetData);
                alert('Budget saved successfully! You can now generate a PDF or send it to the client.');
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            {new URLSearchParams(location.search).get('edit') ? 'Update Budget' : 'Save Budget'}
          </button>
          <button
            onClick={() => {
              // Here you would generate and download a PDF
              alert('PDF generation feature would be implemented here.');
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Generate PDF
          </button>

          <button
            onClick={() => {
              const searchParams = new URLSearchParams(location.search);
              const editBudgetId = searchParams.get('edit');
              const budgetData = {
                clientId: selectedClientId !== 'new' ? selectedClientId : undefined,
                newClient: selectedClientId === 'new' ? newClient : undefined,
                project,
                budgetType: selectedBudgetType,
                sections,
                totals: {
                  subtotal: calculateProjectTotal(),
                  gst: calculateProjectTotal() * 0.07,
                  total: calculateProjectTotal() * 1.07
                },
                status: 'draft',
                updatedAt: new Date().toISOString()
              };
              let budgetId;
              if (editBudgetId) {
                // Update existing budget
                budgetData.id = editBudgetId;
                budgetData.createdAt = state.budgets.find(b => b.id === editBudgetId)?.createdAt || new Date().toISOString();
                actions.updateBudget(budgetData);
                budgetId = editBudgetId;
              } else {
                // Create new budget
                budgetData.createdAt = new Date().toISOString();
                budgetId = actions.addBudget(budgetData);
              }
              navigate(`/quotation/generate/${budgetId}`);
            }}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Generate Quotation
          </button>
        </div>
      </div>
    );
  };

  // Stepper content switch
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-200 ${
                  currentStep === idx + 1
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : currentStep > idx + 1
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-200 text-gray-400 border-gray-300'
                }`}
              >
                {idx + 1}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{step.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRightIcon className="w-5 h-5 text-gray-300 mx-2 lg:mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-150 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === 2 && !selectedBudgetType}
          className={`flex items-center px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-150 ${
            currentStep === 2 && !selectedBudgetType
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
          }`}
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
          <ChevronRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default BudgetCreation; 