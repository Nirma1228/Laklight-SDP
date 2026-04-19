import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatSriLankanDate } from './dateFormatter';

/**
 * Generates a PDF report with a standardized project header and table.
 * @param {Object} options Configuration for the PDF
 * @param {string} options.orientation Orientation of the PDF ('portrait' or 'landscape')
 * @param {string} options.title Title of the report
 * @param {string} options.subtitle Subtitle or description
 * @param {Array} options.headers Table headers
 * @param {Array} options.data Table data rows
 * @param {string} options.filename Filename to save as
 * @param {Object} options.stats Optional stats to display in the header
 */
export const generatePDFReport = ({ title, subtitle, headers, data, filename, stats, orientation = 'portrait' }) => {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Theme Colors ---
  const PRIMARY_GREEN = '#1a5d1a';
  const SECONDARY_GREEN = '#2e7d32';
  const TEXT_DARK = '#334155';
  const TEXT_LIGHT = '#64748b';

  // --- Header Section ---
  // Project Logo/Name
  doc.setFontSize(22);
  doc.setTextColor(PRIMARY_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('LAKLIGHT FOOD PRODUCTS', 14, 20);

  // Divider
  doc.setDrawColor(PRIMARY_GREEN);
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  // Report Title
  doc.setFontSize(18);
  doc.setTextColor(TEXT_DARK);
  doc.text(title.toUpperCase(), 14, 38);

  // Generation Date
  doc.setFontSize(10);
  doc.setTextColor(TEXT_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${formatSriLankanDate(new Date())}`, 14, 45);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(TEXT_DARK);
    const splitSubtitle = doc.splitTextToSize(subtitle, pageWidth - 28);
    doc.text(splitSubtitle, 14, 55);
  }

  // Stats (if any)
  let tableStartY = 70;
  if (stats && Object.keys(stats).length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(SECONDARY_GREEN);
    doc.setFont('helvetica', 'bold');
    
    let statsY = 65;
    Object.entries(stats).forEach(([label, value], index) => {
      const xPos = index % 2 === 0 ? 14 : pageWidth / 2;
      const yOffset = Math.floor(index / 2) * 8;
      doc.text(`${label}: ${value}`, xPos, statsY + yOffset);
      tableStartY = statsY + yOffset + 12;
    });
  }

  // --- Table Section ---
  autoTable(doc, {
    startY: tableStartY,
    head: [headers],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: SECONDARY_GREEN,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_DARK,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 20, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(9);
      doc.setTextColor(TEXT_LIGHT);
      doc.text(str, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
      doc.text('Official System Generated Report | Confidential', 14, doc.internal.pageSize.getHeight() - 10);
    }
  });

  // Save the PDF
  doc.save(filename || `Laklight_Report_${Date.now()}.pdf`);
};
