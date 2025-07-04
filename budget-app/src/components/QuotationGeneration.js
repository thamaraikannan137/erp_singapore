import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBudget } from "../context/BudgetContext";
import {
  PrinterIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  EyeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import QuotationLayout from "./QuotationLayout";
import QuotationTermsPage from "./QuotationTermsPage";

// Function to generate quotation from budget with sections (moved outside component)
const generateQuotationFromBudget = (budget, clients) => {
  console.log("🔄 Generating quotation from budget with sections:", budget.id);

  // Handle client data
  let client;
  if (budget.clientId && budget.clientId !== "new") {
    client = clients.find((c) => c.id === budget.clientId);
  } else if (budget.newClient && budget.newClient.companyName) {
    client = {
      name: budget.newClient.companyName,
      contactPerson: budget.newClient.clientName,
      email: budget.newClient.clientEmail,
      phone: budget.newClient.phoneNumber,
      address: budget.newClient.address || budget.newClient.projectLocation,
    };
  }

  if (!client) {
    client = {
      name: "Unknown Client",
      contactPerson: "Unknown Contact",
      email: "unknown@example.com",
      phone: "",
      address: "",
    };
  }

  // Process sections into quotation sections
  const quotationSections = [];
  const warrantySections = [];
  let itemNumber = 1;

  if (budget.sections && budget.sections.length > 0) {
    budget.sections.forEach((section, sectionIndex) => {
      // Calculate section totals
      const materialsTotal =
        section.materials?.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        ) || 0;
      const toolsTotal =
        section.tools?.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        ) || 0;
      const labourTotal =
        section.labour?.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        ) || 0;
      const sectionTotal = materialsTotal + toolsTotal + labourTotal;

      // Check if this is a warranty section
      const isWarranty =
        section.name?.toLowerCase().includes("warranty") ||
        section.name?.toLowerCase().includes("guarantee") ||
        section.name?.toLowerCase().includes("warrant");

      // Transform images from budget format to quotation format
      const transformedImages = (section.images || []).map((image) => ({
        src: image.url || image.src, // Use url from budget or src if already transformed
        alt: image.name || image.alt || "Section image",
        overlay: image.overlay || null,
      }));

      // Create section object for quotation
      const quotationSection = {
        id: `section-${section.id}`,
        itemNumber: isWarranty ? null : itemNumber++, // Warranty sections don't get numbered
        name: section.name,
        description: section.description,
        quantity: 1, // Default quantity for section
        uom: "Lump sum", // Default UOM for section
        rate: sectionTotal, // Rate is the section total
        amount: sectionTotal,
        sectionTotal: sectionTotal,
        images: transformedImages,
        annotations: section.annotations || [],
      };

      if (isWarranty) {
        warrantySections.push(quotationSection);
      } else {
        quotationSections.push(quotationSection);
      }
    });
  }

  // Add warranty sections at the end
  if (warrantySections.length > 0) {
    warrantySections.forEach((warranty, index) => {
      warranty.itemNumber = quotationSections.length + index + 1;
      quotationSections.push(warranty);
    });
  }

  // Calculate totals
  const subtotal = quotationSections.reduce(
    (sum, section) => sum + section.sectionTotal,
    0
  );
  const gst = subtotal * 0.07;
  const total = subtotal + gst;

  // Generate quotation number
  const clientAbbr =
    client?.name
      ?.replace(/[^A-Za-z]/g, "")
      .substring(0, 3)
      .toUpperCase() || "CLT";
  const quotationNumber = `CGR-QUO-${clientAbbr}-${new Date().getFullYear()}-${String(
    Date.now()
  ).slice(-6)}`;

  const quotation = {
    id: Date.now().toString(),
    budgetId: budget.id,
    quotationNumber,
    client,
    project: budget.project,
    sections: quotationSections,
    totals: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    },
    createdAt: new Date().toISOString(),
    validityDays: 15,
    status: "pending",
  };

  console.log("✅ Quotation generated with sections");
  console.log("- Sections count:", quotationSections.length);
  console.log("- Warranty sections:", warrantySections.length);
  console.log("- Total amount:", quotation.totals.total);

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
  const sampleQuotation = useMemo(
    () => ({
      id: "sample-001",
      quotationNumber: "CGR-QUO-NC-25-03-077",
      budgetId: null,
      client: {
        name: "Church of St Alphonsus (Novena Church)",
        contactPerson: "Mr. Bernard",
        email: "operations@novenachurch.com",
        phone: "+65 6255 2133",
        address: "300 Thomson Rd, Singapore 307653",
      },
      project: {
        serviceType: "Repair Granite panel & Sealant works",
        projectScale: "Large",
        urgencyLevel: "normal",
        startDate: "2024-01-15",
        duration: "3 months",
        description:
          "Repair Granite panel & Sealant works at Church of St Alphonsus (Novena Church) 300 Thomson Rd, Singapore 307653",
      },
      sections: [
        {
          id: "section-1",
          itemNumber: 1,
          name: "Install back Granite panel at clock tower",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\nInstall with SS316 bracket mounting on the existing RC structure.\nApply non-stain non-bleeding silicon sealant.\nCarry out general cleaning before handover.",
          quantity: 2,
          uom: "",
          rate: 700.0,
          amount: 1400.0,
          sectionTotal: 1400.0,
          images: [
            {
              src: "https://i.imgur.com/k6lP0Wn.png",
              alt: "Clock tower detail",
              overlay: "Drop1",
            },
          ],
          annotations: [
            {
              type: "red",
              text: "3] Top coping stone panel is missing, to re-instate, how much?",
            },
            {
              type: "blue",
              text: "#1] The new stone panel is supply by who Client or Contractor. Thickness 35mm",
            },
          ],
        },
        {
          id: "section-2",
          itemNumber: 2,
          name: "Re-Sealant Work to the clock tower",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\nClean the granite gap with IPA and apply primer to enhance adhesion between the sealant and the substrate, ensuring a stronger bond that can withstand movement and environmental factors like UV radiation and moisture.\nApply with non-stain non-bleed weatherbound silicon Sealant to the granite gape.\nInsert Backer-rod to existing gape before applying the sealant.",
          quantity: 1,
          uom: "Lump sum",
          rate: 17200.0,
          amount: 17200.0,
          sectionTotal: 17200.0,
          images: [
            {
              src: "https://i.imgur.com/Xw12n1T.png",
              alt: "Clock tower sealant work",
            },
          ],
          annotations: [
            {
              type: "blue",
              text: "#2] Silicone sealant from brand DowSil, Sika or GE Momentive only. example DC991 or SCS9000NB or WS-355N only.\nSealant to the entire Clock tower, at 2 sides - front and side facing the mall from Ground Level to top.",
            },
          ],
        },
        {
          id: "section-3",
          itemNumber: 3,
          name: "Re-Sealant Work to the beam soffit",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\nClean the granite gap with IPA and apply primer to enhance adhesion between the sealant and the substrate, ensuring a stronger bond that can withstand movement and environmental factors like UV radiation and moisture.\nApply with non-stain non-bleed weatherbound silicon Sealant to the granite gape.\nInsert Backer-rod to existing gape before applying the sealant.\nCarry out general cleaning before handover.",
          quantity: 11,
          uom: "Lump sum",
          rate: 600.0,
          amount: 6600.0,
          sectionTotal: 6600.0,
          images: [
            {
              src: "https://i.imgur.com/rN55K2v.png",
              alt: "Beam soffit detail 1",
            },
            {
              src: "https://i.imgur.com/2s4R5uC.png",
              alt: "Beam soffit detail 2",
            },
          ],
          annotations: [
            {
              type: "blue",
              text: "#3] Silicone sealant from brand DowSil, Sika or GE Momentive only. example DC991 or SCS9000NB or WS-355N only.\nSealant to all the soffit panels and upturned.",
            },
          ],
        },
        {
          id: "section-4",
          itemNumber: 4,
          name: "Re-Sealant Work to the granite strip on the column",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\nClean the granite gap with IPA and apply primer to enhance adhesion between the sealant and the substrate, ensuring a stronger bond that can withstand movement and environmental factors like UV radiation and moisture.\nApply with non-stain non-bleed weatherbound silicon Sealant to the granite gape.\nInsert Backer-rod to existing gape before applying the sealant.\nCarry out general cleaning before handover.",
          quantity: 2,
          uom: "Lump sum",
          rate: 350.0,
          amount: 700.0,
          sectionTotal: 700.0,
          images: [
            {
              src: "https://i.imgur.com/uR18uU9.png",
              alt: "Column detail 1",
            },
            {
              src: "https://i.imgur.com/R8iX6Xj.png",
              alt: "Column detail 2",
            },
          ],
          annotations: [
            {
              type: "blue",
              text: "#4] Silicone sealant from brand DowSil, Sika or GE Momentive only. example DC991 or SCS9000NB or WS-355N only.\nSealant to all the small size column stone panels to at least 2 columns as highlighted",
            },
          ],
        },
        {
          id: "section-5",
          itemNumber: 5,
          name: "Granite strip Repair with mechanism fixing",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\ninstall with SS316 bracket / Slot-hole rod with pin mounting on the existing RC structure.\nApply non-stain non-bleeding silicon sealant to the granite gap.\nCarry out general cleaning before handover.",
          quantity: 2,
          uom: "Lump sum",
          rate: 2000.0,
          amount: 4000.0,
          sectionTotal: 4000.0,
          images: [
            {
              src: "https://i.imgur.com/xO4bH3L.png",
              alt: "Granite strip repair area",
            },
          ],
          annotations: [
            {
              type: "blue",
              text: "#5] Silicone sealant from brand DowSil, Sika or GE Momentive only. example DC991 or SCS9000NB or WS-355N only.\nRepair to all the vertically narrow strips to all vertical lines",
            },
          ],
        },
        {
          id: "section-6",
          itemNumber: 6,
          name: "Install Restraining bracket for Granite Cladding",
          description:
            "To carry out necessary cleaning and protection to the work area prior to the works commencement.\ninstall with SS316 bracket / Slot-hole rod with pin mounting on the existing RC structure anchor bolt or Hilti HIT-RE 500 V4 EPOXY.\nApply non-stain non-bleeding silicon sealant to the granite gap.\nCarry out general cleaning before handover.",
          quantity: 44,
          uom: "",
          rate: 200.0,
          amount: 8800.0,
          sectionTotal: 8800.0,
          images: [
            {
              src: "https://i.imgur.com/W29K458.png",
              alt: "Restraining bracket area",
            },
          ],
          annotations: [
            {
              type: "blue",
              text: "#6] Silicone sealant from brand DowSil, Sika or GE Momentive only. example DC991 or SCS9000NB or WS-355N only.\nRepair by adding top (1 nos) and bottom (1) nos) - grade SS304 threaded rod of at least 8mm diameter, with oversize washer to be epoxy-coated with stone colour, per stone to provision of at least 20-nos of stone.\nThis is specifically applicable to those stone panel (at the clock tower) found without any bracketing system behind the stone, if any.",
            },
            {
              type: "blue",
              text: "#7] Kindly allow for buffer amount of $50k, for just in case budget and other unknown defect found or to repair other defects.",
            },
            {
              type: "red",
              text: "#8] Provision sum for full close range inspection, to determine all the stone pane has the necessary bracketing system behind the stone, to the front entrances and side facing entrances of the clock tower and side tower, how much?\nb) To carry out full pre-conditional survey = how much?",
            },
          ],
        },
      ],
      totals: {
        subtotal: 38700.0,
        gst: 2709.0,
        total: 41409.0,
      },
      createdAt: new Date().toISOString(),
      validityDays: 15,
      status: "draft",
    }),
    []
  );

  const loadSampleQuotation = () => {
    setQuotation(sampleQuotation);
    actions.setCurrentQuotation(sampleQuotation);
    setIsLoading(false);
  };

  const generateQuotation = useCallback(() => {
    console.log("🔄 generateQuotation called");
    console.log("budgetId:", budgetId);
    console.log("state.budgets:", state.budgets);
    console.log("state.clients:", state.clients);

    if (budgetId) {
      // Try to find existing budget
      const existingBudget = state.budgets.find((b) => b.id === budgetId);
      console.log("existingBudget found:", existingBudget);
      
      if (existingBudget) {
        console.log("Found existing budget:", existingBudget.id);
        console.log("Budget sections:", existingBudget.sections);

        // Generate quotation with sections data
        const generatedQuotation = generateQuotationFromBudget(
          existingBudget,
          state.clients
        );
        console.log("Generated quotation:", generatedQuotation);
        
        setQuotation(generatedQuotation);
        actions.setCurrentQuotation(generatedQuotation);
        setIsLoading(false);
        return;
      } else {
        console.log("❌ Budget not found with ID:", budgetId);
      }
    } else {
      console.log("❌ No budgetId provided");
    }

    // Fallback to sample quotation
    console.log("🔄 Falling back to sample quotation");
    setQuotation(sampleQuotation);
    actions.setCurrentQuotation(sampleQuotation);
    setIsLoading(false);
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
    alert("PDF export functionality would be implemented here");
  };

  const handleEmailQuotation = () => {
    if (quotation?.client?.email) {
      const subject = `Quotation ${quotation.quotationNumber} - ${
        quotation.project?.serviceType || "Construction"
      } Works`;
      const body = `Dear ${quotation.client?.contactPerson || "Sir/Madam"},

Thank you for your interest in our services. Please find attached our detailed quotation for the ${
        quotation.project?.serviceType || "Construction"
      } works at ${quotation.client?.name || "your location"}.

Quotation Details:
- Quotation Number: ${quotation.quotationNumber}
- Project Type: ${quotation.project?.serviceType || "Construction"}
- Total Amount: $${quotation.totals?.total?.toFixed(2) || "0.00"}
- Validity: ${quotation.validityDays} Days

If you have any questions or require additional information, please do not hesitate to contact us.

Best regards,
Century Global Resources Pte Ltd
Tel: +65 6457 5855
Email: admin@centurygr.com`;

      const mailtoLink = `mailto:${
        quotation.client.email
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;
      window.open(mailtoLink);
    } else {
      alert(
        "Client email not available. Please ensure client information is complete."
      );
    }
  };

  if (isLoading || !quotation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Quotation...
          </h2>
          <p className="text-gray-600">
            Please wait while we generate your quotation.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {budgetId
              ? `Looking for budget ID: ${budgetId}`
              : "Generating sample quotation..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Action Bar */}
      <div className="no-print mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quotation {quotation.quotationNumber}
              {quotation.id === "sample-001" && (
                <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Sample Data
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {quotation.client?.name || "TBD"} -{" "}
              {quotation.project?.serviceType || "Construction"}
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
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </button>

            <button
              onClick={loadSampleQuotation}
              className="btn-secondary flex items-center"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Sample Quotation
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
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="text-2xl font-bold text-gray-900">
            ${quotation.totals?.subtotal?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-primary-600">
            ${quotation.totals?.total?.toFixed(2) || "0.00"}
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
      <div
        className={`${
          previewMode ? "shadow-2xl" : ""
        } transition-all duration-300`}
      >
        <div className="quotation-document" ref={printRef}>
          <style jsx>{`
            /* Quotation Document Specific Styles */
            .quotation-document {
              background-color: #d1d1d1;
              font-family: Calibri, Candara, Segoe, "Segoe UI", Optima, Arial,
                sans-serif;
              font-size: 11pt;
              color: #000;
              line-height: 1.3;
              padding: 20px;
              max-width: 100%;
              margin: 0 auto;
            }

            .quotation-document * {
              box-sizing: border-box;
            }

            .quotation-document .page {
              background: #fff;
              width: 100%;
              max-width: 210mm;
              min-height: 297mm;
              margin: 0 auto 20px auto;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
              padding: 18mm;
              display: flex;
              flex-direction: column;
            }

            .quotation-document .content-body {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }

            /* Header & Footer */
            .quotation-document .header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              border-bottom: 2px solid #007aba;
            }

            .quotation-document .header .logo-container img {
              height: 93px;
            }

            .quotation-document .header .company-info {
              text-align: center;
            }

            .quotation-document .header .company-name {
              font-size: 18pt;
              font-weight: bold;
              color: #007aba;
            }

            .quotation-document .header .company-details {
              font-size: 9pt;
              line-height: 1.3;
            }

            .quotation-document .footer {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding-top: 10px;
              margin-top: 15px;
              border-top: 1px solid #ccc;
              flex-shrink: 0;
              font-size: 9pt;
            }

            .quotation-document .footer .page-number {
              margin-bottom: 10px;
              font-weight: bold;
            }

            .quotation-document .footer-logos {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
            }

            .quotation-document .footer-logos img {
              height: 40px;
              vertical-align: middle;
            }

            .quotation-document .footer-logos img:first-child {
              margin-right: 15px;
            }

            .quotation-document .footer-logos img:last-child {
              margin-left: 15px;
            }

            /* Document Content Styling */
            .quotation-document .quotation-title {
              font-size: 18pt;
              font-weight: bold;
              text-align: center;
              text-decoration: underline;
              margin: 15px 0 20px 0;
            }

            .quotation-document .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin-bottom: 15px;
              font-size: 10.5pt;
              line-height: 1.6;
            }

            .quotation-document .info-grid .label {
              font-weight: bold;
              display: inline-block;
              width: 85px;
            }

            .quotation-document .subject-line {
              margin-bottom: 20px;
              font-size: 10.5pt;
            }

            .quotation-document p {
              margin-bottom: 12px;
            }

            .quotation-document .costing-title {
              font-size: 16pt;
              font-weight: bold;
              text-align: center;
              text-decoration: underline;
              margin: 25px 0 10px 0;
            }

            /* High-Accuracy Quotation Table */
            .quotation-document .quotation-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10pt;
            }

            .quotation-document .quotation-table th,
            .quotation-document .quotation-table td {
              border: 1px solid #000;
              padding: 4px 6px;
              vertical-align: top;
              line-height: 1.3;
            }

            .quotation-document .quotation-table th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: center;
            }

            .quotation-document .table-main-header td {
              background-color: #f2f2f2;
              font-weight: bold;
            }

            .quotation-document .item-heading td {
              font-weight: bold;
            }

            .quotation-document .description-content p {
              margin-bottom: 4px;
            }

            .quotation-document .final-note {
              margin-top: 20px;
              font-weight: bold;
            }

            /* Terms Page Styles */
            .quotation-document .terms-title {
              font-size: 14pt;
              font-weight: bold;
              text-decoration: underline;
              margin: 20px 0;
              text-align: center;
            }

            .quotation-document .terms-list {
              padding-left: 25px;
              line-height: 1.6;
              list-style-type: decimal;
            }

            .quotation-document .terms-list li {
              padding-left: 5px;
              margin-bottom: 10px;
              display: list-item;
            }

            .quotation-document .acceptance-section {
              margin-top: 30px;
            }

            .quotation-document .acceptance-title {
              font-weight: bold;
              text-decoration: underline;
              margin-bottom: 10px;
              font-size: 11pt;
            }

            .quotation-document .signature-area {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }

            .quotation-document .signature-block {
              width: 45%;
              display: flex;
              flex-direction: column;
              min-height: 120px;
            }

            .quotation-document .signature-block.right {
              text-align: center;
            }

            .quotation-document .signature-image {
              height: 93px;
              margin-top: 20px;
              width: 40%;
            }

            .quotation-document .signature-line {
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: auto;
              font-size: 9.5pt;
            }

            .quotation-document .pm-details {
              margin-top: auto;
              padding-top: 20px;
              font-size: 9.5pt;
              line-height: 1.4;
            }

            .quotation-document .pm-details a {
              color: #0000ee;
              text-decoration: none;
            }

            /* Utility Classes */
            .quotation-document .font-bold {
              font-weight: bold;
            }
            .quotation-document .text-center {
              text-align: center;
            }
            .quotation-document .text-right {
              text-align: right;
            }
            .quotation-document .underline {
              text-decoration: underline;
            }

            /* Print Styles */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              
              .quotation-document {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .quotation-document .page {
                background: white !important;
                margin: 0 !important;
                padding: 18mm !important;
                width: 210mm !important;
                min-height: 297mm !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                break-after: page !important;
                break-inside: avoid !important;
                display: block !important;
                box-shadow: none !important;
              }
              
              .quotation-document .page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
              
                          .quotation-document .no-print {
              display: none !important;
            }
          }
          
          /* Responsive styles for screen display */
          @media screen and (max-width: 768px) {
            .quotation-document {
              padding: 10px;
            }
            
            .quotation-document .page {
              padding: 10mm;
              margin: 0 auto 10px auto;
            }
            
            .quotation-document .quotation-title {
              font-size: 14pt;
            }
            
            .quotation-document .costing-title {
              font-size: 12pt;
            }
          }
          `}</style>

          {/* Image Modal */}
          <div
            id="imageModal"
            className="modal"
            style={{
              display: "none",
              position: "fixed",
              zIndex: 1000,
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              className="modal-close"
              style={{
                position: "absolute",
                top: "20px",
                right: "35px",
                color: "#f1f1f1",
                fontSize: "40px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              ×
            </span>
            <img
              className="modal-content"
              id="modalImage"
              alt=""
              style={{
                margin: "auto",
                display: "block",
                maxWidth: "90%",
                maxHeight: "90vh",
              }}
            />
          </div>

          {/* Main Quotation Content */}
          <QuotationLayout quotation={quotation} pageNumber={1} totalPages={2}>
            <h1 className="quotation-title">QUOTATION</h1>

            <div className="info-grid">
              <div>
                <span className="label">To</span>:{" "}
                {quotation.client?.email || "N/A"}
                <br />
                <span className="label">Attn</span>:{" "}
                {quotation.client?.contactPerson || "N/A"}
                <br />
                <span className="label">Cc</span>: bala@centurygr.com
                <br />
                <span className="label">Tel</span>:{" "}
                {quotation.client?.phone || "+65 6255 2133"}
                <br />
                <span className="label">Hp</span>:{" "}
                {quotation.client?.phone || "+65 8822 4166"}
              </div>
              <div>
                <span className="label">Our Ref.</span>:{" "}
                {quotation.quotationNumber}
                <br />
                <span className="label">Company</span>:{" "}
                {quotation.client?.name || "N/A"}
                <br />
                <span className="label">Date</span>:{" "}
                {new Date(quotation.createdAt).toLocaleDateString("en-GB")}
                <br />
                <span className="label">Validity</span>:{" "}
                {quotation.validityDays} Days
                <br />
                <span className="label">No of Pages</span>: 2
              </div>
            </div>

            <div className="subject-line">
              <span className="font-bold underline">
                Subject: Quotation for provision of{" "}
                {quotation.project?.serviceType || "Construction"} works at{" "}
                {quotation.client?.name || "Client"}{" "}
                {quotation.client?.address || ""}.
              </span>
            </div>

            <p>Dear {quotation.client?.contactPerson || "Sir/Madam"},</p>
            <p>
              Thank you for the invitation to quote for the above-mentioned
              project.
            </p>
            <p>
              Along with the information supplied, we are pleased to provide the
              following options for your kind consideration. This quote is based
              on the unit rate; kindly refer to the{" "}
              <span className="font-bold">Quotation and Costing</span> table.
              Completion of the project is largely dependent on weather
              conditions and client's operational activities.
            </p>
            <p>
              We trust that our proposal shall meet with your approval. If you
              have any further queries regarding the rates or require additional
              information, please do not hesitate to contact us.
            </p>

            <h2 className="costing-title">Quotation and Costing</h2>

            <table className="quotation-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>*UOM</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-main-header">
                  <td colSpan="6">
                    {quotation.project?.description || "Construction works"} at{" "}
                    {quotation.client?.name || "Client"}{" "}
                    {quotation.client?.address || ""}.
                  </td>
                </tr>

                {quotation.sections
                  ?.filter(
                    (section) =>
                      !section.name?.toLowerCase().includes("warranty") &&
                      !section.name?.toLowerCase().includes("guarantee") &&
                      !section.name?.toLowerCase().includes("warrant")
                  )
                  .map((section, index) => (
                    <React.Fragment key={section.id}>
                      {/* Section Heading Row */}
                      <tr className="item-heading">
                        <td className="text-center">{section.itemNumber}</td>
                        <td>{section.name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>

                      {/* Section Detail Row */}
                      <tr>
                        <td className="text-center">{section.itemNumber}.1</td>
                        <td className="description-content">
                          {section.description && (
                            <div>
                              {section.description
                                .split("\n")
                                .map((line, idx) => (
                                  <p key={idx}>• {line.trim()}</p>
                                ))}
                            </div>
                          )}

                          {/* Images */}
                          {section.images && section.images.length > 0 && (
                            <div
                              className="image-container"
                              style={{ marginTop: "8px" }}
                            >
                              <div
                                className="image-gallery"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                  marginTop: "8px",
                                }}
                              >
                                {section.images.map((image, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    style={{ position: "relative" }}
                                  >
                                    <img
                                      src={image.src}
                                      alt={image.alt}
                                      className="main-image"
                                      style={{
                                        maxWidth: "300px",
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
                                        cursor: "pointer",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    {image.overlay && (
                                      <div
                                        className="img-overlay-drop1"
                                        style={{
                                          position: "absolute",
                                          fontFamily: "Kalam, cursive",
                                          color: "white",
                                          backgroundColor:
                                            "rgba(204, 0, 0, 0.8)",
                                          padding: "1px 7px",
                                          borderRadius: "4px",
                                          fontSize: "9pt",
                                          top: "10px",
                                          left: "10px",
                                        }}
                                      >
                                        {image.overlay}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Annotations */}
                          {section.annotations &&
                            section.annotations.length > 0 && (
                              <div>
                                {section.annotations.map(
                                  (annotation, annIdx) => (
                                    <div
                                      key={annIdx}
                                      className={`annotation annotation-${annotation.type}`}
                                      style={{
                                        fontFamily: "Kalam, cursive",
                                        padding: "5px 6px",
                                        fontSize: "9pt",
                                        lineHeight: "1.3",
                                        marginTop: "8px",
                                        border: "1px solid",
                                        ...(annotation.type === "red"
                                          ? {
                                              color: "#c00000",
                                              borderColor: "#f99",
                                              backgroundColor: "#fff0f0",
                                            }
                                          : {
                                              color: "#0000D0",
                                              borderColor: "#99f",
                                              backgroundColor: "#f0f0ff",
                                            }),
                                      }}
                                    >
                                      {annotation.text}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </td>
                        <td className="text-center">{section.quantity}</td>
                        <td className="text-center">{section.uom}</td>
                        <td className="text-right">
                          ${section.rate?.toFixed(2) || "0.00"}
                        </td>
                        <td className="text-right">
                          ${section.amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}

                {/* Warranty sections */}
                {quotation.sections
                  ?.filter(
                    (section) =>
                      section.name?.toLowerCase().includes("warranty") ||
                      section.name?.toLowerCase().includes("guarantee") ||
                      section.name?.toLowerCase().includes("warrant")
                  )
                  .map((warranty, index) => (
                    <tr
                      className="item-heading"
                      key={`warranty-${warranty.id}`}
                    >
                      <td className="text-center">{warranty.itemNumber}</td>
                      <td>{warranty.name}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                <tr className="font-bold">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-right">Total=</td>
                  <td className="text-right">
                    ${quotation.totals?.subtotal?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="final-note">
              Note: All{" "}
              {quotation.project?.serviceType?.toLowerCase() || "materials"}{" "}
              meet industry standards and come with manufacturer warranties.
              Project completion timeline depends on weather conditions and
              client's operational activities.
            </div>
          </QuotationLayout>

          {/* Terms & Conditions Page */}
          <QuotationTermsPage
            quotation={quotation}
            pageNumber={2}
            totalPages={2}
          />
        </div>
      </div>

      {/* Back Button */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => navigate("/budget/list")}
          className="btn-secondary"
        >
          Back to Budget List
        </button>
      </div>

      {/* Image Modal JavaScript */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const closeModal = document.querySelector(".modal-close");

            document.querySelectorAll('.main-image').forEach(img => {
              img.onclick = function(){
                modal.style.display = "flex";
                modalImg.src = this.src;
              }
            });

            const hideModal = () => { modal.style.display = "none"; };
            closeModal.onclick = hideModal;
            modal.onclick = (event) => { if (event.target === modal) hideModal(); };
          });
        `,
        }}
      />
    </div>
  );
};

export default QuotationGeneration;
