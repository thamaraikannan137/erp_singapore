# ERP Budget Management System

A comprehensive React.js + Tailwind CSS application for budget creation, management, and quotation generation specifically designed for Century Global Resources Pte Ltd.

## 🚀 Features

### 1. Budget Creation Workflow
- **Step 1: Budget Setup**
  - Client information management (existing + new client option)
  - Project classification (service type, scale, urgency)
  - Project details and timeline

- **Step 2: Budget Type Selection**
  - Labour + Material + Tools (Full Service)
  - Labour + Tools (Client Provides Materials)
  - Labour Only (Hourly Wages)

- **Step 3: Dynamic Cost Calculator**
  - Labour cost calculation by skill category
  - Material cost tracking with supplier info
  - Tool and equipment rental costs
  - Real-time cost calculations

- **Step 4: Cost Breakdown Table**
  - Interactive item management
  - Category-wise cost organization
  - GST calculations (7% for Singapore)
  - Export capabilities

### 2. Dynamic Quotation Generation
- Exact PDF replica design using React components
- Professional quotation layout matching original format
- Dynamic content population from budget data
- Print and email functionality
- Client-specific quotation numbering

### 3. Client Management
- Complete client database
- Contact information tracking
- Project history and statistics
- Budget value analytics per client

### 4. Dashboard & Analytics
- Real-time budget statistics
- Recent activity tracking
- Quick action shortcuts
- Performance metrics

## 🛠️ Technical Stack

- **Frontend**: React.js 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Icons**: Heroicons
- **Routing**: React Router DOM 6.15.0
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form 7.45.4
- **Data Export**: XLSX library
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional Tailwind plugins**
   ```bash
   npm install @tailwindcss/forms
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
budget-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── BudgetCreation.js      # 4-step budget creation wizard
│   │   ├── BudgetList.js          # Budget management and filtering
│   │   ├── QuotationGeneration.js # Dynamic PDF-style quotations
│   │   ├── Dashboard.js           # Analytics and overview
│   │   ├── ClientManagement.js    # Client database management
│   │   ├── Header.js              # Top navigation bar
│   │   └── Sidebar.js             # Left navigation menu
│   ├── context/
│   │   └── BudgetContext.js       # Global state management
│   ├── App.js                     # Main application component
│   ├── index.js                   # Application entry point
│   └── index.css                  # Global styles and Tailwind imports
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Focus indicators

### Performance
- Component lazy loading
- Optimized re-renders
- Local storage persistence
- Fast search and filtering

## 💼 Business Workflow

### Gather Info → Prepare Budget → Generate Quotation

1. **Information Gathering**
   - Client requirements collection
   - Site assessment data
   - Material specifications
   - Labour requirements

2. **Internal Budget Preparation**
   - Cost calculation and validation
   - Profit margin application
   - Risk factor consideration
   - Approval workflow

3. **Client Quotation Generation**
   - Professional document creation
   - Terms and conditions inclusion
   - Digital delivery options
   - Follow-up tracking

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_COMPANY_NAME="Century Global Resources Pte Ltd"
REACT_APP_COMPANY_EMAIL="norul@centurygr.com"
REACT_APP_COMPANY_PHONE="+65 8515 6635"
REACT_APP_GST_RATE=7
```

### Customization
- Update company branding in `src/context/BudgetContext.js`
- Modify service types and labour categories
- Adjust quotation template in `QuotationGeneration.js`
- Customize color scheme in `tailwind.config.js`

## 📋 Usage Guide

### Creating a Budget
1. Navigate to "Create Budget"
2. Complete the 4-step wizard:
   - Setup client and project info
   - Select budget type
   - Use the cost calculator
   - Review and finalize breakdown
3. Save as draft or submit for approval

### Generating Quotations
1. Go to "Budget List"
2. Click the quotation icon for approved budgets
3. Review the generated quotation
4. Print, email, or export as needed

### Managing Clients
1. Access "Client Management"
2. Add new clients or edit existing ones
3. View client statistics and history
4. Track project relationships

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Various Platforms
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Azure Static Web Apps**: GitHub integration

## 🔄 Data Management

### Local Storage
- Budget data persisted locally
- Client information stored
- Draft budgets auto-saved
- Settings and preferences

### Export/Import
- Excel export for budget data
- PDF generation for quotations
- CSV export for client lists
- Backup and restore functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or feature requests:
- Email: norul@centurygr.com
- Phone: +65 8515 6635

## 📄 License

This project is proprietary software developed for Century Global Resources Pte Ltd.

---

**Century Global Resources Pte Ltd**  
Polaris, #04-21, 101 Woodlands Ave 12, Singapore 737719  
HP: +65 8515 6635 | Email: norul@centurygr.com 