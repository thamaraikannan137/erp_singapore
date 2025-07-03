// Quotation Document JavaScript Functions
class QuotationManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.calculateTotals();
            this.addPrintButton();
            this.addTableInteractivity();
            this.addEmailClickFunctionality();
            this.addFormValidation();
            this.addKeyboardShortcuts();
        });
    }

    // Calculate totals dynamically
    calculateTotals() {
        const amountCells = document.querySelectorAll('.quotation-table .amount');
        let total = 0;
        
        amountCells.forEach(cell => {
            const text = cell.textContent.replace(/[$,]/g, '');
            const amount = parseFloat(text);
            if (!isNaN(amount) && !cell.parentElement.classList.contains('total-row')) {
                total += amount;
            }
        });
        
        console.log('Calculated total:', total);
        
        // Update total if total row exists
        const totalCell = document.querySelector('.total-row .amount');
        if (totalCell) {
            totalCell.innerHTML = `<strong>$${total.toLocaleString('en-US', {
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
            })}</strong>`;
        }
    }

    // Add print functionality
    addPrintButton() {
        // Check if print button already exists
        if (document.querySelector('.print-btn')) {
            return;
        }

        const printBtn = document.createElement('button');
        printBtn.textContent = 'Print Document';
        printBtn.className = 'print-btn';
        
        printBtn.onclick = () => {
            this.printDocument();
        };
        
        document.body.appendChild(printBtn);
        
        // Hide print button when printing
        window.addEventListener('beforeprint', () => {
            printBtn.style.display = 'none';
        });
        
        window.addEventListener('afterprint', () => {
            printBtn.style.display = 'block';
        });
    }

    // Print document with proper formatting
    printDocument() {
        // Save current title
        const originalTitle = document.title;
        
        // Set print-friendly title
        document.title = 'Quotation - CGR-QUO-NC-25-03-077';
        
        // Print
        window.print();
        
        // Restore original title
        document.title = originalTitle;
    }

    // Add interactive table features
    addTableInteractivity() {
        const tableRows = document.querySelectorAll('.quotation-table tbody tr');
        
        tableRows.forEach(row => {
            // Add hover effects
            row.addEventListener('mouseenter', () => {
                if (!row.classList.contains('item-number') && 
                    !row.classList.contains('total-row')) {
                    row.style.backgroundColor = '#f8f9fa';
                    row.style.transform = 'scale(1.001)';
                    row.style.transition = 'all 0.2s ease';
                }
            });
            
            row.addEventListener('mouseleave', () => {
                if (!row.classList.contains('item-number') && 
                    !row.classList.contains('total-row')) {
                    row.style.backgroundColor = '';
                    row.style.transform = '';
                }
            });

            // Add click to highlight functionality
            row.addEventListener('click', () => {
                // Remove previous highlights
                document.querySelectorAll('.highlighted-row').forEach(r => {
                    r.classList.remove('highlighted-row');
                });
                
                // Add highlight to clicked row
                if (!row.classList.contains('item-number') && 
                    !row.classList.contains('total-row')) {
                    row.classList.add('highlighted-row');
                    
                    // Add CSS for highlight if it doesn't exist
                    if (!document.querySelector('#highlight-style')) {
                        const style = document.createElement('style');
                        style.id = 'highlight-style';
                        style.textContent = `
                            .highlighted-row {
                                background-color: #fff3cd !important;
                                border-left: 4px solid #ffc107 !important;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            });
        });
    }

    // Add email click functionality
    addEmailClickFunctionality() {
        const emailElements = document.querySelectorAll('div');
        
        emailElements.forEach(el => {
            const text = el.textContent;
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const emails = text.match(emailRegex);
            
            if (emails && emails.length > 0) {
                el.classList.add('email-clickable');
                el.title = 'Click to copy email address';
                
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyEmailToClipboard(emails[0]);
                });
            }
        });
    }

    // Copy email to clipboard with notification
    copyEmailToClipboard(email) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(email).then(() => {
                this.showNotification(`Email "${email}" copied to clipboard!`, 'success');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(email);
            });
        } else {
            this.fallbackCopyTextToClipboard(email);
        }
    }

    // Fallback copy method for older browsers
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification(`Email "${text}" copied to clipboard!`, 'success');
        } catch (err) {
            this.showNotification('Failed to copy email address', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = '#dc3545';
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Add form validation for future enhancements
    addFormValidation() {
        // This can be expanded for any future form elements
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    // Validate individual form fields
    validateField(field) {
        // Basic validation - can be expanded
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.style.borderColor = '#dc3545';
            this.showNotification(`${field.name || 'Field'} is required`, 'error');
            return false;
        } else {
            field.style.borderColor = '';
            return true;
        }
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+P for print
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.printDocument();
            }
            
            // Ctrl+S for save (will trigger browser save)
            if (e.ctrlKey && e.key === 's') {
                // Let browser handle save, but show notification
                this.showNotification('Use Ctrl+S to save the page', 'info');
            }
            
            // Escape to clear highlights
            if (e.key === 'Escape') {
                document.querySelectorAll('.highlighted-row').forEach(r => {
                    r.classList.remove('highlighted-row');
                });
            }
        });
    }

    // Export functionality (for future use)
    exportToCSV() {
        const table = document.querySelector('.quotation-table');
        if (!table) return;
        
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                return '"' + cell.textContent.replace(/"/g, '""') + '"';
            });
            csv.push(rowData.join(','));
        });
        
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotation_CGR-QUO-NC-25-03-077.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Quotation exported to CSV', 'success');
    }

    // Generate PDF (requires external library - placeholder)
    generatePDF() {
        this.showNotification('PDF generation requires additional library (jsPDF)', 'info');
        // Implementation would require jsPDF library
        // window.jsPDF can be used here if library is included
    }

    // Summary calculation
    getQuotationSummary() {
        const summary = {
            totalItems: document.querySelectorAll('.item-number').length - 1, // Exclude header
            totalAmount: 0,
            date: document.querySelector('.company-info .right div:nth-child(2)')?.textContent || '',
            reference: document.querySelector('.company-info .right div:nth-child(1)')?.textContent || ''
        };
        
        const amountCells = document.querySelectorAll('.quotation-table .amount');
        amountCells.forEach(cell => {
            const text = cell.textContent.replace(/[$,]/g, '');
            const amount = parseFloat(text);
            if (!isNaN(amount) && !cell.parentElement.classList.contains('total-row')) {
                summary.totalAmount += amount;
            }
        });
        
        return summary;
    }
}

// Initialize the quotation manager
const quotationManager = new QuotationManager();

// Expose some functions globally for console access
window.quotationManager = quotationManager;
window.exportQuotationCSV = () => quotationManager.exportToCSV();
window.generateQuotationPDF = () => quotationManager.generatePDF();
window.getQuotationSummary = () => quotationManager.getQuotationSummary(); 