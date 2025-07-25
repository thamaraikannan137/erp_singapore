import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';

// Initial state
const initialState = {
  budgets: [],
  clients: [
    {
      id: '1',
      name: 'Church of St Alphonsus (Novena Church)',
      contactPerson: 'Mr. Bernard',
      email: 'operations@novenachurch.com',
      phone: '+65 6255 2133',
      address: '300 Thomson Rd, Singapore 307653',
      projects: []
    }
  ],
  currentBudget: null,
  currentQuotation: null,
  serviceTypes: [
    'Plumbing',
    'Painting',
    'Aluminum Works',
    'Granite & Stone Works',
    'General Repairs',
    'Multiple Services'
  ],
  labourCategories: [
    { id: 'master', name: 'Master Craftsman', baseRate: 200 },
    { id: 'skilled', name: 'Skilled Worker', baseRate: 150 },
    { id: 'helper', name: 'Helper', baseRate: 100 }
  ],
  materialCategories: [
    'Pipes & Fittings',
    'Paint & Coatings',
    'Aluminum Profiles',
    'Granite & Stone',
    'Hardware & Tools',
    'Safety Equipment',
    'Other Materials'
  ]
};

// Action types
const ActionTypes = {
  ADD_CLIENT: 'ADD_CLIENT',
  UPDATE_CLIENT: 'UPDATE_CLIENT',
  DELETE_CLIENT: 'DELETE_CLIENT',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  CREATE_REVISION: 'CREATE_REVISION',
  SET_CURRENT_BUDGET: 'SET_CURRENT_BUDGET',
  SET_CURRENT_QUOTATION: 'SET_CURRENT_QUOTATION',
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA'
};

// Reducer
function budgetReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_CLIENT:
      return {
        ...state,
        clients: [...state.clients, action.payload] // payload already has ID
      };
    
    case ActionTypes.UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        )
      };
    
    case ActionTypes.DELETE_CLIENT:
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };
    
    case ActionTypes.ADD_BUDGET:
      const newBudget = {
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      };
      
      // If this budget has a new client, save the client to the clients array
      let updatedClients = state.clients;
      if (action.payload.newClient && action.payload.newClient.companyName) {
        const newClient = {
          id: Date.now().toString(),
          name: action.payload.newClient.companyName,
          contactPerson: action.payload.newClient.clientName,
          email: action.payload.newClient.clientEmail,
          phone: action.payload.newClient.phoneNumber,
          address: action.payload.newClient.address,
          projectLocation: action.payload.newClient.projectLocation
        };
        updatedClients = [...state.clients, newClient];
        
        // Update the budget to reference the new client ID
        newBudget.clientId = newClient.id;
        delete newBudget.newClient; // Remove the newClient data since it's now saved
      }
      
      return {
        ...state,
        budgets: [...state.budgets, newBudget],
        clients: updatedClients
      };
    
    case ActionTypes.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id 
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : budget
        )
      };
    
    case ActionTypes.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload)
      };
    
    case ActionTypes.CREATE_REVISION:
      const originalBudget = state.budgets.find(b => b.id === action.payload.originalBudgetId);
      if (!originalBudget) return state;
      
      const revision = {
        ...action.payload.revision,
        id: Date.now().toString(),
        parentBudgetId: originalBudget.parentBudgetId || originalBudget.id,
        revisionNumber: (originalBudget.revisionNumber || 1) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        isRevision: true
      };
      
      return {
        ...state,
        budgets: [...state.budgets, revision]
      };
    
    case ActionTypes.SET_CURRENT_BUDGET:
      return {
        ...state,
        currentBudget: action.payload
      };
    
    case ActionTypes.SET_CURRENT_QUOTATION:
      return {
        ...state,
        currentQuotation: action.payload
      };
    
    case ActionTypes.LOAD_DATA:
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
}

// Context
const BudgetContext = createContext();

// Provider component
export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem('budgetAppData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ActionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budgetAppData', JSON.stringify({
      budgets: state.budgets,
      clients: state.clients
    }));
  }, [state.budgets, state.clients]);

  // Memoized utility functions
  const calculateBudgetTotals = useCallback((budgetItems) => {
    const subtotal = budgetItems.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0);
    const gst = subtotal * 0.07; // 7% GST for Singapore
    const total = subtotal + gst;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }, []);

  const getBudgetById = useCallback((budgetId) => state.budgets.find(b => b.id === budgetId), [state.budgets]);
  const getClientById = useCallback((clientId) => state.clients.find(c => c.id === clientId), [state.clients]);

  const generateQuotation = useCallback((budget) => {
    console.log('🔄 Generating quotation for budget:', budget.id);
    console.log('- Budget clientId:', budget.clientId);
    console.log('- Available clients:', state.clients.map(c => ({ id: c.id, name: c.name })));
    
    // Handle both new client and existing client scenarios
    let client;
    if (budget.clientId && budget.clientId !== 'new') {
      client = state.clients.find(c => c.id === budget.clientId);
      console.log('- Found existing client:', client ? client.name : 'NOT FOUND');
    } else if (budget.newClient && budget.newClient.name) {
      // Fallback to newClient data if clientId is 'new' or missing
      client = {
        name: budget.newClient.name,
        contactPerson: budget.newClient.contactPerson,
        email: budget.newClient.email,
        phone: budget.newClient.phone,
        address: budget.newClient.address || budget.newClient.projectLocation
      };
      console.log('- Using newClient data:', client.name);
    }
    
    if (!client) {
      console.warn('⚠️ No client data found for budget:', budget.id);
      client = {
        name: 'Unknown Client',
        contactPerson: 'Unknown Contact',
        email: 'unknown@example.com',
        phone: '',
        address: ''
      };
    }
    
    const totals = calculateBudgetTotals(budget.items || []);
    
    // Generate quotation number with client abbreviation
    const clientAbbr = client?.name?.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'CLT';
    const quotationNumber = `CGR-QUO-${clientAbbr}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const quotation = {
      id: Date.now().toString(),
      budgetId: budget.id,
      quotationNumber,
      client,
      project: budget.project,
      items: budget.items || [],
      totals,
      createdAt: new Date().toISOString(),
      validityDays: 15,
      status: 'pending'
    };
    
    console.log('✅ Quotation generated successfully');
    console.log('- Client:', quotation.client.name);
    console.log('- Items count:', quotation.items.length);
    console.log('- Total amount:', quotation.totals.total);
    
    return quotation;
  }, [state.clients, calculateBudgetTotals]);

  // Memoized action creators
  const actions = useMemo(() => ({
    addClient: (client) => {
      const clientWithId = { ...client, id: Date.now().toString() };
      dispatch({ type: ActionTypes.ADD_CLIENT, payload: clientWithId });
      return clientWithId.id; // Return the generated ID
    },
    updateClient: (client) => dispatch({ type: ActionTypes.UPDATE_CLIENT, payload: client }),
    deleteClient: (clientId) => dispatch({ type: ActionTypes.DELETE_CLIENT, payload: clientId }),
    
    addBudget: (budget) => {
      const budgetId = Date.now().toString();
      const budgetWithId = { ...budget, id: budgetId };
      dispatch({ type: ActionTypes.ADD_BUDGET, payload: budgetWithId });
      return budgetId; // Return the generated ID
    },
    updateBudget: (budget) => dispatch({ type: ActionTypes.UPDATE_BUDGET, payload: budget }),
    deleteBudget: (budgetId) => dispatch({ type: ActionTypes.DELETE_BUDGET, payload: budgetId }),
    
    createRevision: (originalBudgetId, revisionData) => 
      dispatch({ 
        type: ActionTypes.CREATE_REVISION, 
        payload: { originalBudgetId, revision: revisionData } 
      }),
    
    setCurrentBudget: (budget) => dispatch({ type: ActionTypes.SET_CURRENT_BUDGET, payload: budget }),
    setCurrentQuotation: (quotation) => dispatch({ type: ActionTypes.SET_CURRENT_QUOTATION, payload: quotation }),
    
    // Utility functions
    getBudgetById,
    getClientById,
    calculateBudgetTotals,
    generateQuotation,
    
    // Revision tracking utilities
    getRevisionHistory: (budget) => {
      const parentId = budget.parentBudgetId || budget.id;
      return state.budgets.filter(b => 
        b.id === parentId || b.parentBudgetId === parentId
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    getLatestRevision: (budget) => {
      const revisions = state.budgets.filter(b => 
        b.id === budget.id || b.parentBudgetId === (budget.parentBudgetId || budget.id)
      );
      return revisions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }
  }), [dispatch, getBudgetById, getClientById, calculateBudgetTotals, generateQuotation, state.budgets]);

  return (
    <BudgetContext.Provider value={{ state, actions }}>
      {children}
    </BudgetContext.Provider>
  );
}

// Custom hook
export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
} 