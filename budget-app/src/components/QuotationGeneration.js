import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { 
  PrinterIcon, 
  ArrowDownTrayIcon, 
  EnvelopeIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import QuotationLayout from './QuotationLayout';
import QuotationTermsPage from './QuotationTermsPage';

// Function to generate quotation from budget with sections (moved outside component)
const generateQuotationFromBudget = (budget, clients) => {
  console.log('🔄 Generating quotation from budget with sections:', budget.id);
  
  // Handle client data
  let client;
  if (budget.clientId && budget.clientId !== 'new') {
    client = clients.find(c => c.id === budget.clientId);
  } else if (budget.newClient && budget.newClient.companyName) {
    client = {
      name: budget.newClient.companyName,
      contactPerson: budget.newClient.clientName,
      email: budget.newClient.clientEmail,
      phone: budget.newClient.phoneNumber,
      address: budget.newClient.address || budget.newClient.projectLocation
    };
  }
  
  if (!client) {
    client = {
      name: 'Unknown Client',
      contactPerson: 'Unknown Contact',
      email: 'unknown@example.com',
      phone: '',
      address: ''
    };
  }

  // Process sections into quotation items
  const quotationItems = [];
  let itemNumber = 1;
  let cumulativeTotal = 0;

  if (budget.sections && budget.sections.length > 0) {
    budget.sections.forEach((section, sectionIndex) => {
      // Calculate section totals
      const materialsTotal = section.materials?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
      const toolsTotal = section.tools?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
      const labourTotal = section.labour?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
      const sectionTotal = materialsTotal + toolsTotal + labourTotal;
      cumulativeTotal += sectionTotal;

      // Add section as main item
      quotationItems.push({
        id: `section-${section.id}`,
        itemNumber: itemNumber++,
        description: section.name,
        isSection: true,
        sectionDescription: section.description,
        materials: section.materials || [],
        tools: section.tools || [],
        labour: section.labour || [],
        sectionTotal: sectionTotal,
        cumulativeTotal: cumulativeTotal
      });

      // Add materials items
      if (section.materials && section.materials.length > 0) {
        section.materials.forEach(material => {
          quotationItems.push({
            id: `material-${material.id}`,
            itemNumber: itemNumber++,
            description: material.name,
            category: 'Material',
            quantity: material.quantity,
            unit: material.unit,
            unitRate: material.unitPrice,
            notes: material.description,
            parentSection: section.id
          });
        });
      }

      // Add tools items
      if (section.tools && section.tools.length > 0) {
        section.tools.forEach(tool => {
          quotationItems.push({
            id: `tool-${tool.id}`,
            itemNumber: itemNumber++,
            description: tool.name,
            category: 'Tool',
            quantity: tool.quantity,
            unit: tool.unit,
            unitRate: tool.unitPrice,
            notes: tool.description,
            parentSection: section.id
          });
        });
      }

      // Add labour items
      if (section.labour && section.labour.length > 0) {
        section.labour.forEach(labour => {
          quotationItems.push({
            id: `labour-${labour.id}`,
            itemNumber: itemNumber++,
            description: labour.name,
            category: 'Labour',
            quantity: labour.quantity,
            unit: labour.unit,
            unitRate: labour.unitPrice,
            notes: labour.description,
            parentSection: section.id
          });
        });
      }
    });
  } else {
    // Fallback to old items structure
    quotationItems.push(...(budget.items || []).map((item, index) => ({
      ...item,
      itemNumber: index + 1
    })));
  }

  // Calculate totals
  const subtotal = quotationItems.reduce((sum, item) => {
    if (item.isSection) return sum;
    return sum + (item.quantity * item.unitRate);
  }, 0);
  const gst = subtotal * 0.07;
  const total = subtotal + gst;

  // Generate quotation number
  const clientAbbr = client?.name?.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'CLT';
  const quotationNumber = `CGR-QUO-${clientAbbr}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const quotation = {
    id: Date.now().toString(),
    budgetId: budget.id,
    quotationNumber,
    client,
    project: budget.project,
    items: quotationItems,
    sections: budget.sections || [],
    totals: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    },
    createdAt: new Date().toISOString(),
    validityDays: 15,
    status: 'pending'
  };

  console.log('✅ Quotation generated with sections');
  console.log('- Sections count:', budget.sections?.length || 0);
  console.log('- Items count:', quotationItems.length);
  console.log('- Total amount:', quotation.totals.total);

  return quotation;
};

const QuotationGeneration = () => {
  const { budgetId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useBudget();
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const printRef = useRef();

  // Sample quotation data for demonstration
  const sampleQuotation = useMemo(() => ({
    id: 'sample-001',
    quotationNumber: 'CGR-QUO-SC-25-03-001',
    budgetId: null,
    client: {
      name: 'Sample Construction Company Ltd',
      contactPerson: 'Mr. John Smith',
      email: 'john.smith@sampleconstruction.com',
      phone: '+65 9123 4567',
      address: '123 Sample Street, Singapore 123456'
    },
    project: {
      serviceType: 'Plumbing',
      projectScale: 'Medium',
      urgencyLevel: 'normal',
      startDate: '2024-01-15',
      duration: '2 weeks',
      description: 'Complete plumbing renovation for office building at 123 Sample Street, Singapore 123456'
    },
    items: [
      {
        id: 1,
        description: 'Install new water supply system',
        category: 'Labour',
        quantity: 1,
        unit: 'Lump sum',
        unitRate: 5000.00,
        notes: 'Complete installation of water supply pipes and fittings'
      },
      {
        id: 2,
        description: 'Install drainage system',
        category: 'Labour',
        quantity: 1,
        unit: 'Lump sum',
        unitRate: 3500.00,
        notes: 'Installation of drainage pipes and waste outlets'
      },
      {
        id: 3,
        description: 'Pressure testing and commissioning',
        category: 'Labour',
        quantity: 1,
        unit: 'Lump sum',
        unitRate: 800.00,
        notes: 'Complete system testing and commissioning'
      }
    ],
    totals: {
      subtotal: 9300.00,
      gst: 651.00,
      total: 9951.00
    },
    createdAt: new Date().toISOString(),
    validityDays: 15,
    status: 'draft'
  }), []);

  const generateQuotation = useCallback(() => {
    let mounted = true;
    
    if (!mounted) return;
    
    if (budgetId) {
      // Try to find existing budget
      const existingBudget = state.budgets.find(b => b.id === budgetId);
      if (existingBudget) {
        console.log('Found existing budget:', existingBudget.id);
        console.log('Budget sections:', existingBudget.sections);
        
        // Generate quotation with sections data
        const generatedQuotation = generateQuotationFromBudget(existingBudget, state.clients);
        if (mounted) {
          setQuotation(generatedQuotation);
          actions.setCurrentQuotation(generatedQuotation);
          setIsLoading(false);
        }
        return;
      }
    }
    
    // Fallback to sample quotation
    if (mounted) {
      setQuotation(sampleQuotation);
      actions.setCurrentQuotation(sampleQuotation);
      setIsLoading(false);
    }
  }, [budgetId, state.budgets, state.clients, sampleQuotation, actions]);

  useEffect(() => {
    generateQuotation();

    return () => {
      // No-op for now, as generateQuotation is now a useCallback
    };
  }, [generateQuotation]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // This would integrate with a PDF generation library
    alert('PDF export functionality would be implemented here');
  };

  const handleEmailQuotation = () => {
    if (quotation?.client?.email) {
      const subject = `Quotation ${quotation.quotationNumber} - ${quotation.project?.description || 'Construction Works'}`;
      const body = `Dear ${quotation.client?.contactPerson || 'Sir/Madam'},\n\nPlease find attached our quotation for your project.\n\nBest regards,\nCentury Global Resources Pte Ltd`;
      const mailtoLink = `mailto:${quotation.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  if (isLoading || !quotation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Quotation...</h2>
          <p className="text-gray-600">Please wait while we generate your quotation.</p>
          <div className="mt-4 text-sm text-gray-500">
            {budgetId ? `Looking for budget ID: ${budgetId}` : 'Generating sample quotation...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Action Bar */}
      <div className="no-print mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quotation {quotation.quotationNumber}
              {quotation.id === 'sample-001' && (
                <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Sample Data
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {quotation.client?.name || 'TBD'} - {quotation.project?.serviceType || 'Construction'}
            </p>
            {quotation.budgetId && (
              <p className="text-sm text-gray-500">
                Generated from Budget ID: {quotation.budgetId}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-secondary flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            
            <button
              onClick={handleEmailQuotation}
              className="btn-secondary flex items-center"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Email
            </button>
            
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="text-2xl font-bold text-gray-900">
            ${quotation.totals?.subtotal?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">GST (7%)</div>
          <div className="text-2xl font-bold text-gray-900">
            ${quotation.totals?.gst?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-primary-600">
            ${quotation.totals?.total?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Validity</div>
          <div className="text-2xl font-bold text-gray-900">
            {quotation.validityDays} Days
          </div>
        </div>
      </div>

      {/* Quotation Document */}
      <div className={`${previewMode ? 'shadow-2xl' : ''} transition-all duration-300`}>
        <div className="bg-white" ref={printRef}>
          {/* Main Quotation Content */}
          <QuotationLayout quotation={quotation}>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-lg font-bold underline">QUOTATION</h1>
            </div>
            
            {/* Company Info */}
            <div className="flex justify-between mb-6">
              <div className="text-xs">
                <div><strong>To:</strong> {quotation.client?.email || 'N/A'}</div>
                <div><strong>Attn:</strong> {quotation.client?.contactPerson || 'N/A'}</div>
                <div><strong>Cc:</strong> bala@centurygr.com</div>
                <div><strong>Tel:</strong> +65 6255 2133</div>
                <div><strong>Hp:</strong> +65 8822 4166</div>
              </div>
              <div className="text-xs text-right">
                <div><strong>Our Ref.:</strong> {quotation.quotationNumber}</div>
                <div><strong>Company:</strong> {quotation.client?.name || 'N/A'}</div>
                <div><strong>Date:</strong> {new Date(quotation.createdAt).toLocaleDateString('en-GB')}</div>
                <div><strong>Validity:</strong> {quotation.validityDays} Days</div>
                <div><strong>No of Pages:</strong> 2</div>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <strong>Subject:</strong> Quotation for provision of {quotation.project?.serviceType || 'Construction'} works at {quotation.client?.name || 'Client'} {quotation.client?.address || ''}.
            </div>

            {/* Content */}
            <div className="mb-6 text-justify">
              <p>Dear {quotation.client?.contactPerson || 'Sir/Madam'},</p>
              <p>Thank you for the invitation to quote for the above-mentioned project.</p>
              <p>Along with the information supplied, we are pleased to provide the following options for your kind consideration.</p>
              <p>This quote is based on the unit rate; kindly refer to the Quotation and Costing table. Completion of the project is largely dependent on weather conditions and client's operational activities.</p>
              <p>We trust that our proposal shall meet with your approval. If you have any further queries regarding the rates or require additional information, please do not hesitate to contact us.</p>
            </div>

            <h3 className="font-bold mb-4">Quotation and Costing</h3>

            {/* Items Table */}
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-center" style={{ width: '8%' }}>No</th>
                  <th className="border border-black p-2 text-left" style={{ width: '50%' }}>Description</th>
                  <th className="border border-black p-2 text-center" style={{ width: '10%' }}>Qty</th>
                  <th className="border border-black p-2 text-center" style={{ width: '10%' }}>*UOM</th>
                  <th className="border border-black p-2 text-center" style={{ width: '11%' }}>Rate</th>
                  <th className="border border-black p-2 text-center" style={{ width: '11%' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Project Header */}
                <tr className="bg-gray-50">
                  <td colSpan="6" className="border border-black p-2 font-bold">
                    <strong>{quotation.project?.serviceType || 'Construction'} works at {quotation.client?.name || 'Client'} {quotation.client?.address || ''}.</strong>
                  </td>
                </tr>
                
                {quotation.items?.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {item.isSection ? (
                      // Section header
                      <tr>
                        <td className="border border-black p-2 text-center font-bold bg-gray-50">
                          <strong>{item.itemNumber}</strong>
                        </td>
                        <td colSpan="4" className="border border-black p-2 font-bold">
                          <strong>{item.description}</strong>
                          {item.sectionDescription && (
                            <div className="text-xs text-gray-600 mt-1">{item.sectionDescription}</div>
                          )}
                        </td>
                        <td className="border border-black p-2 text-right font-bold">
                          <strong>${item.sectionTotal?.toFixed(2) || '0.00'}</strong>
                        </td>
                      </tr>
                    ) : (
                      // Regular item
                      <>
                        <tr>
                          <td className="border border-black p-2 text-center font-bold bg-gray-50">
                            <strong>{item.itemNumber}</strong>
                          </td>
                          <td colSpan="5" className="border border-black p-2 font-bold">
                            <strong>{item.description}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 text-center font-bold" style={{ paddingLeft: '20px' }}>
                            <strong>{item.itemNumber}.1</strong>
                          </td>
                          <td colSpan="5" className="border border-black p-2">
                            <div style={{ marginLeft: '20px' }}>
                              <div>• To carry out necessary cleaning and protection to the work area prior to the works commencement.</div>
                              {item.category === 'Material' && (
                                <div>• Supply and install high-quality materials as per specifications.</div>
                              )}
                              {item.category === 'Tool' && (
                                <div>• Supply and install high-quality tools as per specifications.</div>
                              )}
                              {item.category === 'Labour' && (
                                <div>• Provide skilled workforce for professional execution.</div>
                              )}
                              <div>• Apply appropriate safety measures and quality control.</div>
                              <div>• Carry out general cleaning before handover.</div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2 text-center">{item.quantity}</td>
                          <td className="border border-black p-2 text-center">{item.unit}</td>
                          <td className="border border-black p-2 text-right">${item.unitRate?.toFixed(2) || '0.00'}</td>
                          <td className="border border-black p-2 text-right">${((item.quantity || 0) * (item.unitRate || 0)).toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Warranty and Total */}
                <tr>
                  <td className="border border-black p-2 text-center font-bold bg-gray-50">
                    <strong>{(quotation.items?.length || 0) + 1}</strong>
                  </td>
                  <td colSpan="5" className="border border-black p-2 font-bold">
                    <strong>Warranty 5 years</strong>
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="5" className="border border-black p-2 text-right">
                    <strong>Total=</strong>
                  </td>
                  <td className="border border-black p-2 text-right">
                    <strong>${quotation.totals?.total?.toFixed(2) || '0.00'}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Note */}
            <div className="mt-6 font-bold">
              <strong>Note:</strong> All materials meet industry standards and come with manufacturer warranties.
            </div>
          </QuotationLayout>

          {/* Terms & Conditions Page */}
          <QuotationTermsPage quotation={quotation} />
        </div>
      </div>

      {/* Back Button */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => navigate('/budget/list')}
          className="btn-secondary"
        >
          Back to Budget List
        </button>
      </div>
    </div>
  );
};

export default QuotationGeneration; 