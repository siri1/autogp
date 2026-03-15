# 📊 Advanced Excel Reports Export - Complete Guide

## 🎯 Overview

Your application now includes a **professional Excel report generation system** with multiple sheets, formatted output, and comprehensive analytics.

## ✨ Features

### 1. **Multi-Sheet Excel Reports**
Export data to Excel files with multiple organized sheets:
- Customer Overview (with totals)
- Active Customers
- Pending Customers
- Revenue Analysis

### 2. **Professional Formatting**
- ✅ **Color-coded headers** - Different colors for each sheet
- ✅ **Alternating row colors** - Better readability
- ✅ **Auto-sized columns** - Optimized width for content
- ✅ **Totals rows** - Automatic calculations
- ✅ **Summary page** - Report metadata and statistics

### 3. **Export Options**

#### **Full Report (All Sheets)**
- Includes all 4 data sheets
- Summary page with metadata
- Complete analytics

#### **With Summary Sheet**
- Report metadata
- Sheet statistics
- Generation timestamp

#### **Simple Export**
- Quick single-sheet export
- Fast download

#### **Other Formats**
- CSV (Comma-separated)
- PDF (Formatted report)
- JSON (Structured data)

## 🚀 How to Use

### **Step 1: Navigate to Advanced Reports**
1. Open the Customer Dashboard
2. Click on the **"Advanced Reports"** tab
3. View the report preview

### **Step 2: Export Report**
1. Click **"Export Report"** button
2. Choose format:
   - Excel Reports → Full Report (All Sheets)
   - Excel Reports → With Summary Sheet
   - Excel Reports → Simple Export
   - CSV (Comma Separated)
   - PDF Report
   - JSON Data

### **Step 3: Open Downloaded File**
- Excel files download with `.xlsx` extension
- Open in Microsoft Excel, Google Sheets, or LibreOffice

## 📁 Report Structure

### **Sheet 1: Summary** (if included)
```
Customer Analytics Report
-----------------------
Report Information
Company: Demo Company Inc.
Generated: [Date/Time]
Total Sheets: 4

Sheet Details
Sheet Name          | Rows
--------------------|------
Customer Overview   | 8
Active Customers    | 5
Pending Customers   | 2
Revenue Analysis    | 3

Total Records: 8
```

### **Sheet 2: Customer Overview**
| ID | Name | Email | Status | Revenue | Orders |
|----|------|-------|--------|---------|--------|
| Customer data... |
| **TOTAL** | | | | **$23,800** | **99** |

### **Sheet 3: Active Customers**
Filtered view of active customers only

### **Sheet 4: Pending Customers**
Filtered view of pending customers only

### **Sheet 5: Revenue Analysis**
| Status | Customer Count | Total Revenue | Avg Revenue |
|--------|---------------|---------------|-------------|
| Active | 5 | $18,650 | $3,730 |
| Pending | 2 | $3,330 | $1,665 |
| Inactive | 1 | $890 | $890 |

## 💻 Code Usage

### **Basic Implementation**

```typescript
import ReportsExportButton from '@/components/ReportsExportButton';

const reportData = {
  title: 'My Report',
  companyName: 'Your Company',
  summary: {
    totalRecords: 100,
    dateRange: '2024-01-01 to 2024-12-31',
  },
  sheets: [
    {
      name: 'Data Sheet',
      headers: ['Column1', 'Column2', 'Column3'],
      rows: [
        ['Value1', 'Value2', 'Value3'],
        ['Value4', 'Value5', 'Value6'],
      ],
      totals: ['TOTAL', '', 'Sum Value'],
      formatting: {
        alternateRows: true,
        headerColor: '4472C4', // Blue
        columnWidths: [15, 30, 20],
      },
    },
  ],
};

<ReportsExportButton reportData={reportData} />
```

### **Advanced Example with Multiple Sheets**

```typescript
const comprehensiveReport = {
  title: 'Sales Analytics Report',
  companyName: 'Acme Corporation',
  summary: {
    totalRecords: 1500,
    dateRange: 'Q1 2024',
    generatedBy: 'Sales Team',
  },
  sheets: [
    {
      name: 'Sales Overview',
      headers: ['Date', 'Product', 'Quantity', 'Revenue'],
      rows: salesData.map(sale => [
        sale.date,
        sale.product,
        sale.quantity,
        sale.revenue,
      ]),
      totals: ['TOTAL', '', totalQty, totalRevenue],
      formatting: {
        alternateRows: true,
        headerColor: '4472C4',
      },
    },
    {
      name: 'Top Products',
      headers: ['Product', 'Units Sold', 'Revenue'],
      rows: topProducts.map(p => [p.name, p.units, p.revenue]),
      formatting: {
        headerColor: '70AD47', // Green
      },
    },
    {
      name: 'Regional Analysis',
      headers: ['Region', 'Sales', 'Growth %'],
      rows: regionData.map(r => [r.region, r.sales, r.growth]),
      formatting: {
        headerColor: 'FFC000', // Orange
      },
    },
  ],
};
```

## 🎨 Header Colors

Pre-configured colors for professional reports:

- **Blue** (`4472C4`) - Default, professional
- **Green** (`70AD47`) - Success, growth data
- **Orange** (`FFC000`) - Warnings, pending items
- **Red** (`C55A11`) - Alerts, critical data
- **Purple** (`7030A0`) - Special categories
- **Gray** (`7F7F7F`) - Summary, metadata

## 📊 Formatting Options

### **AlternateRows**
```typescript
formatting: {
  alternateRows: true, // Enables zebra striping
}
```

### **Column Widths**
```typescript
formatting: {
  columnWidths: [10, 25, 30, 15, 20], // Width in characters
}
```

### **Custom Header Color**
```typescript
formatting: {
  headerColor: '4472C4', // Hex color without #
}
```

## 🔧 Utility Functions

### **Quick Export**
For simple, single-sheet exports:

```typescript
import { quickExcelExport } from '@/lib/advanced-excel-export';

quickExcelExport(
  'Sales Report',
  ['Product', 'Quantity', 'Revenue'],
  [
    ['Product A', 100, '$10,000'],
    ['Product B', 150, '$15,000'],
  ],
  'sales-report.xlsx'
);
```

### **Pivot Summary**
Create summary reports:

```typescript
import { createPivotSummary } from '@/lib/advanced-excel-export';

const summaryData = createPivotSummary(
  rawData,
  0, // Row field index
  2, // Value field index
  'sum' // Aggregation type: sum, count, average
);
```

## 📈 Best Practices

1. **Keep sheet names short** - Max 31 characters
2. **Use descriptive headers** - Clear column names
3. **Include totals** - For numeric columns
4. **Add summary sheet** - For multi-sheet reports
5. **Use consistent colors** - For related data
6. **Optimize column widths** - For readability
7. **Test with sample data** - Before production use

## 🐛 Troubleshooting

### **Export button not working?**
- Check that reportData is properly structured
- Ensure all required fields are present
- Check browser console for errors

### **Excel file corrupted?**
- Verify data doesn't contain invalid characters
- Check that sheet names are valid
- Ensure column widths are reasonable numbers

### **Formatting not applied?**
- Confirm xlsx library is installed: `bun add xlsx`
- Check that formatting object is correct
- Verify color codes are hex without #

## 📚 Examples

### **Financial Report**
```typescript
const financialReport = {
  title: 'Monthly Financial Report',
  sheets: [
    {
      name: 'Income Statement',
      headers: ['Category', 'Amount', 'Change %'],
      rows: incomeData,
      totals: ['Total', totalIncome, avgChange],
      formatting: { headerColor: '70AD47' },
    },
    {
      name: 'Expenses',
      headers: ['Category', 'Amount', 'Budget'],
      rows: expenseData,
      totals: ['Total', totalExpenses, totalBudget],
      formatting: { headerColor: 'C55A11' },
    },
  ],
};
```

### **Customer Analytics**
```typescript
const customerReport = {
  title: 'Customer Analytics',
  sheets: [
    {
      name: 'All Customers',
      headers: ['Name', 'Email', 'LTV', 'Orders'],
      rows: allCustomers,
      formatting: { alternateRows: true },
    },
    {
      name: 'High Value',
      headers: ['Name', 'Email', 'LTV'],
      rows: highValueCustomers,
      formatting: { headerColor: 'FFD700' },
    },
  ],
};
```

## 🎯 Integration with Other Features

### **Combine with Power BI**
Export data, then import into Power BI for visualization

### **Scheduled Reports**
Use in conjunction with cron jobs for automated reporting

### **API Integration**
Fetch data from API, format, and export

## 📞 Support

For issues or questions:
1. Check this guide
2. Review code examples
3. Test with sample data
4. Contact development team

---

**Last Updated:** November 2024
**Version:** 1.0.0
**Author:** Development Team
