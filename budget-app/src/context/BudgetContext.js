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
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      };
      return {
        ...state,
        budgets: [...state.budgets, newBudget]
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
    
    addBudget: (budget) => dispatch({ type: ActionTypes.ADD_BUDGET, payload: budget }),
    updateBudget: (budget) => dispatch({ type: ActionTypes.UPDATE_BUDGET, payload: budget }),
    deleteBudget: (budgetId) => dispatch({ type: ActionTypes.DELETE_BUDGET, payload: budgetId }),
    
    setCurrentBudget: (budget) => dispatch({ type: ActionTypes.SET_CURRENT_BUDGET, payload: budget }),
    setCurrentQuotation: (quotation) => dispatch({ type: ActionTypes.SET_CURRENT_QUOTATION, payload: quotation }),
    
    // Utility functions
    getBudgetById,
    getClientById,
    calculateBudgetTotals,
    generateQuotation
  }), [dispatch, getBudgetById, getClientById, calculateBudgetTotals, generateQuotation]);

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