import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { 
  PrinterIcon, 
  EnvelopeIcon, 
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const QuotationGeneration = () => {
  const { budgetId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useBudget();
  const printRef = useRef();
  
  const [quotation, setQuotation] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the sample quotation to prevent regeneration
  const sampleQuotation = useMemo(() => ({
    id: 'sample-001',
    quotationNumber: 'CGR-QUO-SAMPLE-2024-001',
    client: {
      email: 'operations@novenachurch.com',
      contactPerson: 'Mr. Bernard',
      name: 'Church of St Alphonsus (Novena Church)',
      address: '300 Thomson Rd, Singapore 307653'
    },
    project: {
      description: 'Repair Granite panel & Sealant works',
      serviceType: 'Construction Services'
    },
    items: [
      {
        id: '1',
        description: 'Install back Granite panel at clock tower',
        category: 'Labour',
        quantity: 2,
        unit: 'Lump sum',
        unitRate: 700.00,
        details: [
          'To carry out necessary cleaning and protection to the work area prior to the works commencement.',
          'install with SS316 bracket mounting on the existing RC structure.',
          'Apply non-stain non-bleeding silicon sealant.',
          'Carry out general cleaning before handover.'
        ]
      },
      {
        id: '2',
        description: 'Re-Sealant Work to the clock tower',
        category: 'Labour',
        quantity: 1,
        unit: 'Lump sum',
        unitRate: 17200.00,
        details: [
          'To carry out necessary cleaning and protection to the work area prior to the works commencement.',
          'Clean the granite gap with IPA and apply primer to enhance adhesion between the sealant and the substrate.',
          'Apply with non-stain non-bleed weatherbound silicon Sealant to the granite gape.',
          'Insert Backer-rod to existing gape before applying the sealant.'
        ]
      },
      {
        id: '3',
        description: 'Re-Sealant Work to the beam soffit',
        category: 'Labour',
        quantity: 11,
        unit: 'nos',
        unitRate: 600.00,
        details: [
          'To carry out necessary cleaning and protection to the work area prior to the works commencement.',
          'Clean the granite gap with IPA and apply primer to enhance adhesion.',
          'Apply with non-stain non-bleed weatherbound silicon Sealant to the granite gape.',
          'Insert Backer-rod to existing gape before applying the sealant.',
          'Carry out general cleaning before handover.'
        ]
      }
    ],
    totals: {
      subtotal: 24200.00,
      gst: 1694.00,
      total: 25894.00
    },
    createdAt: new Date().toISOString(),
    validityDays: 15,
    status: 'draft'
  }), []);

  useEffect(() => {
    let mounted = true;
    
    const generateQuotation = () => {
      console.log('🔍 QuotationGeneration Debug:');
      console.log('- budgetId:', budgetId);
      console.log('- Available budgets:', state.budgets.length);
      console.log('- Budget IDs:', state.budgets.map(b => b.id));
      
      if (budgetId) {
        const budget = state.budgets.find(b => b.id === budgetId);
        console.log('- Found budget:', budget ? 'YES' : 'NO');
        
        if (budget && mounted) {
          console.log('- Using real budget data');
          console.log('- Budget details:', budget);
          console.log('- Budget items:', budget.items?.length || 0);
          console.log('- Budget totals:', budget.totals);
          console.log('- Budget clientId:', budget.clientId);
          console.log('- Budget newClient:', budget.newClient);
          const generatedQuotation = actions.generateQuotation(budget);
          console.log('- Generated quotation:', generatedQuotation);
          console.log('- Quotation client:', generatedQuotation.client);
          console.log('- Quotation items:', generatedQuotation.items);
          console.log('- Quotation totals:', generatedQuotation.totals);
          setQuotation(generatedQuotation);
          actions.setCurrentQuotation(generatedQuotation);
        } else if (mounted) {
          console.log('- Budget not found, using sample data');
          // Fallback to sample quotation if budget not found
          setQuotation(sampleQuotation);
          actions.setCurrentQuotation(sampleQuotation);
        }
      } else if (mounted) {
        console.log('- No budgetId provided, using sample data');
        // Use sample quotation when no budgetId provided
        setQuotation(sampleQuotation);
        actions.setCurrentQuotation(sampleQuotation);
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };

    generateQuotation();

    return () => {
      mounted = false;
    };
  }, [budgetId, state.budgets, actions.generateQuotation, actions.setCurrentQuotation, sampleQuotation]);

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

  const createTestBudget = () => {
    console.log('🧪 Creating test budget...');
    
    const testBudget = {
      clientId: '', // No existing client
      newClient: {
        name: 'Test Construction Company Ltd',
        contactPerson: 'Mr. John Smith',
        email: 'john.smith@testconstruction.com',
        phone: '+65 9123 4567',
        address: '123 Test Street, Singapore 123456',
        projectLocation: '123 Test Street, Singapore 123456'
      },
      project: {
        serviceType: 'Plumbing',
        projectScale: 'Medium',
        urgencyLevel: 'normal',
        startDate: '2024-01-15',
        duration: '2 weeks',
        description: 'Complete plumbing renovation for office building'
      },
      budgetType: 'full-service',
      labour: {
        categories: [
          { categoryId: 'master', workers: 2, days: 5, hours: 8, rate: 200 },
          { categoryId: 'skilled', workers: 3, days: 5, hours: 8, rate: 150 },
          { categoryId: 'helper', workers: 1, days: 5, hours: 8, rate: 100 }
        ],
        overtimeRate: 1.5
      },
      materials: [
        { id: 1, description: 'PVC Pipes', quantity: 50, unit: 'meters', unitPrice: 15 },
        { id: 2, description: 'Pipe Fittings', quantity: 20, unit: 'pieces', unitPrice: 25 }
      ],
      tools: [
        { id: 1, description: 'Pipe Cutter', quantity: 2, unit: 'pieces', unitPrice: 150 }
      ],
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
      profitMargin: 15,
      gstRate: 7,
      totals: {
        labour: 0,
        materials: 1250,
        tools: 300,
        subtotal: 9300,
        gst: 651,
        total: 9951
      }
    };

    // First create the client and get the ID
    const clientId = actions.addClient({
      name: 'Test Construction Company Ltd',
      contactPerson: 'Mr. John Smith',
      email: 'john.smith@testconstruction.com',
      phone: '+65 9123 4567',
      address: '123 Test Street, Singapore 123456',
      projects: []
    });
    
    // Update the test budget with the real client ID
    testBudget.clientId = clientId;
    testBudget.newClient = {}; // Clear newClient since we have a real client
    
    console.log('Test budget created with client ID:', clientId);
    actions.addBudget(testBudget);
    
    // Wait a moment for the budget to be saved, then navigate
    setTimeout(() => {
      const savedBudgets = state.budgets;
      const latestBudget = savedBudgets[savedBudgets.length - 1];
      if (latestBudget) {
        console.log('Navigating to quotation for budget:', latestBudget.id);
        navigate(`/quotation/generate/${latestBudget.id}`);
      }
    }, 100);
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

  const QuotationDocument = () => (
    <div className="bg-white" ref={printRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}>
      <style>
        {`
          @media print {
            .print-page-break {
              page-break-after: always;
              break-after: page;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
            .no-print {
              display: none;
            }
          }
          
          table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
          }
          
          td, th {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }
        `}
      </style>
      {/* Page 1 */}
      <div className="min-h-screen p-8 relative print-page-break">
        {/* Page Number - Top Left */}
        <div className="absolute top-4 left-8 text-xs text-gray-600">
          Page 1 of {Math.ceil(quotation.items?.length / 3) + 1}
        </div>
        
        {/* Company Header - Top Right */}
        <div className="absolute top-4 right-8 text-xs text-right">
          <div><strong>Our Ref.:</strong> {quotation.quotationNumber}</div>
          <div><strong>Date:</strong> {new Date(quotation.createdAt).toLocaleDateString('en-GB')}</div>
          <div><strong>Tel:</strong> +65 6255 2133</div>
          <div><strong>Validity:</strong> {quotation.validityDays} Days</div>
          <div><strong>Hp:</strong> +65 8822 4166</div>
          <div><strong>No of Pages:</strong> {Math.ceil(quotation.items?.length / 3) + 1}</div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 pt-16">
          <h1 className="text-xl font-bold underline">QUOTATION</h1>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-xs">
          <div>
            <div><strong>To:</strong> {quotation.client?.email || 'N/A'}</div>
            <div><strong>Attn:</strong> {quotation.client?.contactPerson || 'N/A'}</div>
            <div><strong>Company:</strong> {quotation.client?.name || 'N/A'}</div>
            <div><strong>Cc:</strong> bala@centurygr.com</div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6 text-xs">
          <div>
            <strong>Subject:</strong> Quotation for {quotation.project?.description || 'Construction works'} at {quotation.client?.name || 'TBD'} {quotation.client?.address || ''}.
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-8 text-xs leading-relaxed text-justify">
          <p className="mb-4">Dear {quotation.client?.contactPerson || 'Sir/Madam'},</p>
          <p className="mb-4">Thank you for the invitation to quote for the above-mentioned project.</p>
          <p className="mb-4">Along with the information supplied, we are pleased to provide the following options for your kind consideration.</p>
          <p className="mb-4">This quote is based on the unit rate; kindly refer to the Quotation and Costing table. Completion of the project is largely dependent on weather conditions and client's operational activities.</p>
          <p>We trust that our proposal shall meet with your approval. If you have any further queries regarding the rates or require additional information, please do not hesitate to contact us.</p>
        </div>

        {/* Quotation Table Header */}
        <div className="mb-4">
          <h3 className="font-bold text-sm">Quotation and Costing</h3>
        </div>

        {/* Main Table */}
        <div className="border border-black">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border-r border-black p-2 text-center" style={{ width: '8%' }}>No</th>
                <th className="border-r border-black p-2 text-left" style={{ width: '50%' }}>Description</th>
                <th className="border-r border-black p-2 text-center" style={{ width: '10%' }}>Qty</th>
                <th className="border-r border-black p-2 text-center" style={{ width: '10%' }}>*UOM</th>
                <th className="border-r border-black p-2 text-center" style={{ width: '11%' }}>Rate</th>
                <th className="border-black p-2 text-center" style={{ width: '11%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
                              {/* Project Title Row */}
                <tr>
                  <td colSpan="6" className="border-b border-black p-2 font-bold bg-gray-50">
                    {quotation.project?.description || quotation.project?.serviceType || 'Construction'} works at {quotation.client?.name || 'TBD'} {quotation.client?.address || ''}
                  </td>
                </tr>
              
              {/* Dynamic Items - First 3 items on page 1 */}
              {quotation.items?.slice(0, 3).map((item, index) => (
                <React.Fragment key={item.id}>
                  {/* Main Item Header */}
                  <tr>
                    <td className="border-r border-b border-black p-2 text-center font-bold">
                      {index + 1}
                    </td>
                    <td className="border-r border-b border-black p-2 font-bold" colSpan="5">
                      {item.description}
                    </td>
                  </tr>
                  
                  {/* Sub-item with details */}
                  <tr>
                    <td className="border-r border-b border-black p-2 text-center font-bold" style={{ width: '8%' }}>
                      {index + 1}.1
                    </td>
                    <td className="border-r border-b border-black p-2" style={{ width: '50%' }}>
                      <div className="space-y-1 text-xs" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {item.details ? item.details.map((detail, detailIndex) => (
                          <div key={detailIndex}>• {detail}</div>
                        )) : (
                          <>
                            <div>• To carry out necessary cleaning and protection to the work area prior to the works commencement.</div>
                            {item.category === 'Material' && (
                              <div>• Supply and install high-quality materials as per specifications.</div>
                            )}
                            {item.category === 'Labour' && (
                              <div>• Provide skilled workforce for professional execution.</div>
                            )}
                            <div>• Apply appropriate safety measures and quality control.</div>
                            <div>• Carry out general cleaning before handover.</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="border-r border-b border-black p-2 text-center" style={{ width: '10%' }}>
                      {item.quantity}
                    </td>
                    <td className="border-r border-b border-black p-2 text-center" style={{ width: '10%' }}>
                      {item.unit}
                    </td>
                    <td className="border-r border-b border-black p-2 text-right" style={{ width: '11%' }}>
                      ${item.unitRate.toFixed(2)}
                    </td>
                    <td className="border-b border-black p-2 text-right" style={{ width: '11%' }}>
                      ${(item.quantity * item.unitRate).toFixed(2)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Pages for remaining items */}
      {quotation.items?.length > 3 && (
        <>
          {Array.from({ length: Math.ceil((quotation.items.length - 3) / 3) }, (_, pageIndex) => {
            const startIndex = 3 + pageIndex * 3;
            const endIndex = Math.min(startIndex + 3, quotation.items.length);
            const pageItems = quotation.items.slice(startIndex, endIndex);
            const currentPageNumber = pageIndex + 2;
            
            return (
              <div key={pageIndex} className="min-h-screen p-8 relative print-page-break" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
                {/* Page Number */}
                <div className="absolute top-4 left-8 text-xs text-gray-600">
                  Page {currentPageNumber} of {Math.ceil(quotation.items?.length / 3) + 1}
                </div>

                <div className="pt-8">
                  <div className="border border-black">
                    <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border-r border-black p-2 text-center" style={{ width: '8%' }}>No</th>
                          <th className="border-r border-black p-2 text-left" style={{ width: '50%' }}>Description</th>
                          <th className="border-r border-black p-2 text-center" style={{ width: '10%' }}>Qty</th>
                          <th className="border-r border-black p-2 text-center" style={{ width: '10%' }}>*UOM</th>
                          <th className="border-r border-black p-2 text-center" style={{ width: '11%' }}>Rate</th>
                          <th className="border-black p-2 text-center" style={{ width: '11%' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((item, itemIndex) => {
                          const globalIndex = startIndex + itemIndex;
                          return (
                            <React.Fragment key={item.id}>
                              {/* Main Item Header */}
                              <tr>
                                <td className="border-r border-b border-black p-2 text-center font-bold" style={{ width: '8%' }}>
                                  {globalIndex + 1}
                                </td>
                                <td className="border-r border-b border-black p-2 font-bold" colSpan="5">
                                  {item.description}
                                </td>
                              </tr>
                              
                              {/* Sub-item with details */}
                              <tr>
                                <td className="border-r border-b border-black p-2 text-center font-bold" style={{ width: '8%' }}>
                                  {globalIndex + 1}.1
                                </td>
                                <td className="border-r border-b border-black p-2" style={{ width: '50%' }}>
                                  <div className="space-y-1 text-xs" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                    {item.details ? item.details.map((detail, detailIndex) => (
                                      <div key={detailIndex}>• {detail}</div>
                                    )) : (
                                      <>
                                        <div>• To carry out necessary cleaning and protection to the work area prior to the works commencement.</div>
                                        {item.category === 'Material' && (
                                          <div>• Supply and install high-quality materials as per specifications.</div>
                                        )}
                                        {item.category === 'Labour' && (
                                          <div>• Provide skilled workforce for professional execution.</div>
                                        )}
                                        <div>• Apply appropriate safety measures and quality control.</div>
                                        <div>• Carry out general cleaning before handover.</div>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="border-r border-b border-black p-2 text-center" style={{ width: '10%' }}>
                                  {item.quantity}
                                </td>
                                <td className="border-r border-b border-black p-2 text-center" style={{ width: '10%' }}>
                                  {item.unit}
                                </td>
                                <td className="border-r border-b border-black p-2 text-right" style={{ width: '11%' }}>
                                  ${item.unitRate.toFixed(2)}
                                </td>
                                <td className="border-b border-black p-2 text-right" style={{ width: '11%' }}>
                                  ${(item.quantity * item.unitRate).toFixed(2)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                        
                        {/* Add warranty and total on the last page with items */}
                        {currentPageNumber === Math.ceil(quotation.items?.length / 3) && (
                          <>
                            {/* Warranty Row */}
                            <tr>
                              <td className="border-r border-b border-black p-2 text-center font-bold" style={{ width: '8%' }}>
                                {quotation.items.length + 1}
                              </td>
                              <td className="border-r border-b border-black p-2 font-bold" colSpan="5">
                                Warranty 5 years
                              </td>
                            </tr>
                            
                            {/* Total Row */}
                            <tr className="bg-gray-100 font-bold">
                              <td colSpan="5" className="border-r border-black p-2 text-right">
                                <strong>Total=</strong>
                              </td>
                              <td className="border-black p-2 text-right" style={{ width: '11%' }}>
                                <strong>${quotation.totals?.total?.toFixed(2) || '0.00'}</strong>
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* If items <= 3, add warranty and total to the first page */}
      {quotation.items?.length <= 3 && (
        <div className="border border-black border-t-0">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
            <tbody>
              {/* Warranty Row */}
              <tr>
                <td className="border-r border-b border-black p-2 text-center font-bold" style={{ width: '8%' }}>
                  {quotation.items.length + 1}
                </td>
                <td className="border-r border-b border-black p-2 font-bold" colSpan="5">
                  Warranty 5 years
                </td>
              </tr>
              
              {/* Total Row */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan="5" className="border-r border-black p-2 text-right">
                  <strong>Total=</strong>
                </td>
                <td className="border-black p-2 text-right" style={{ width: '11%' }}>
                  <strong>${quotation.totals?.total?.toFixed(2) || '0.00'}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Note - add to first page */}
      <div className="mt-6 text-xs">
        <strong>Note:</strong> All materials meet industry standards and come with manufacturer warranties.
      </div>

      {/* Terms & Conditions Page */}
      <div className="min-h-screen p-8 relative print-page-break" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
        {/* Page Number */}
        <div className="absolute top-4 left-8 text-xs text-gray-600">
          Page {Math.ceil(quotation.items?.length / 3) + 1} of {Math.ceil(quotation.items?.length / 3) + 1}
        </div>

        <div className="pt-8">
          <h2 className="text-lg font-bold text-center underline mb-8">Payment Terms & Conditions</h2>
          
          <ol className="space-y-4 text-xs leading-relaxed text-justify">
            <li>1. All rates are quoted based on your given drawings and excluding any third-party charges. (Where applicable). Any further alteration, modification items on the drawings or at site shall be subject to review the unit rate accordingly.</li>
            <li>2. Any variation works if required, we will proceed to carry out variation works only upon written confirmation of agreement of rates or lumpsum prices.</li>
            <li>3. All electricity supply (DB Box certified by LEW) & Water and site storage and Access to be supplied by client inclusive of Access, materials, barricading, manpower, hand tools etc.,</li>
            <li>4. Liabilities for consequential damages/ costs are explicitly excluded, and any claims should not exceed the amount we have contracted with the contract sum.</li>
            <li>5. Acceptance of our quotation and return by email. (Please complete all information requested, sign, stamp and return by email). Please note that Century Global Resources Pte Ltd may not perform the work without due authorization.</li>
            <li>6. Submit Purchase Order detailing acceptance of payment details.</li>
            <li>7. All payments are to be made to Century Global Resources Pte Ltd.</li>
            <li>8. Progressive payments are to be made upon claims made fortnightly. (Where applicable)</li>
            <li>9. All prices quoted are exclusive of GST charges.</li>
            <li>10. Payment for each individual invoice shall not exceed Thirty (30) days from the date of our invoice. All payments shall be made to Century Global Resources Pte Ltd only.</li>
          </ol>

          {/* Acknowledgement Section */}
          <div className="mt-12">
            <h3 className="font-bold text-sm mb-4">1. Acknowledgement Acceptance of Quotation</h3>
            <p className="text-xs mb-8 text-justify">
              We have read and understood all the terms and conditions indicated on this quotation regarding the hiring of services from Century Global Resources Pte Ltd. We confirm and agree to accept your services as per us request indicated below.
            </p>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="font-bold mb-4">CENTURY GLOBAL RESOURCES PTE LTD</div>
                <div className="border-b border-black h-12 mb-2"></div>
                <div className="text-xs">
                  <div>Islam Norul</div>
                  <div>Project Manager (Façade Inspector),</div>
                  <div>Century Group of Companies</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-bold mb-4">Confirmed & Accepted By</div>
                <div className="border-b border-black h-12 mb-2"></div>
                <div className="text-xs">Company Stamp / Date & Signature</div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mt-12 text-xs">
              <p>Polaris, #04-21, 101 Woodlands Ave 12, Singapore 737719<br />
              HP: +65 8515 6635 | Email – norul@centurygr.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <QuotationDocument />
      </div>

      {/* Back Button and Budget Selection */}
      <div className="no-print mt-8 text-center space-y-4">
        {!budgetId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800 mb-4">
              📝 This is sample quotation data. To generate a quotation with real budget data:
            </p>
            
            {state.budgets.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-blue-900 font-medium mb-2">Available Budgets:</h4>
                <div className="space-y-2 mb-4">
                  {state.budgets.slice(0, 3).map((budget) => {
                    const client = state.clients.find(c => c.id === budget.clientId);
                    return (
                      <div key={budget.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <div className="font-medium text-gray-900">{client?.name || 'Unknown Client'}</div>
                          <div className="text-sm text-gray-600">{budget.project?.serviceType} - ${budget.totals?.total?.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => navigate(`/quotation/generate/${budget.id}`)}
                          className="btn-primary text-sm"
                        >
                          Generate Quotation
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-white rounded border">
                <p className="text-gray-600">No budgets available. Create a budget first.</p>
              </div>
            )}
            
                         <div className="flex gap-3">
              <button
                onClick={() => navigate('/budget/list')}
                className="btn-primary"
              >
                View All Budgets
              </button>
              <button
                onClick={() => navigate('/budget/create')}
                className="btn-secondary"
              >
                Create New Budget
              </button>
              <button
                onClick={createTestBudget}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Test Budget & Generate Quotation
              </button>
            </div>
          </div>
        )}
        
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