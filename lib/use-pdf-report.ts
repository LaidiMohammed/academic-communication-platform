import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportStudentData {
  name: string;
  age: number | string;
  status: string;
  remainingByModule: Array<{
    module: string;
    sessions: number;
  }>;
}

interface ReportOptions {
  tier: string;
  modules: string[];
  generatedAt?: string;
  generatedBy?: string;
}

export function usePDFReport() {
  const generateReport = useCallback((
    students: ReportStudentData[],
    options: ReportOptions
  ): Blob => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // Header
    doc.setFontSize(18);
    doc.text('Bendella School - Student Report', margin, margin + 5);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const generatedAt = options.generatedAt || new Date().toLocaleString();
    const generatedBy = options.generatedBy || 'Admin';
    doc.text(`Tier: ${options.tier}`, margin, margin + 15);
    doc.text(`Generated: ${generatedAt} by ${generatedBy}`, margin, margin + 20);

    // Table data
    const tableData = students.map(student => {
      const sessions = options.modules.map(module => {
        const moduleData = student.remainingByModule.find(m => m.module === module);
        return moduleData ? moduleData.sessions : 0;
      });

      return [
        student.name,
        typeof student.age === 'number' ? student.age.toString() : student.age || 'N/A',
        student.status,
        ...sessions,
      ];
    });

    // Table headers
    const headers = ['Name', 'Age', 'Status', ...options.modules];

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: margin + 25,
      margin: margin,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [33, 33, 33],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { halign: 'left' },
      },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.pages.length;
        if (pageCount > 1) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      },
    });

    // Add footer with report ID
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Report ID: ${Date.now()} | Modules: ${options.modules.join(', ')}`,
      margin,
      pageHeight - 5
    );

    return doc.output('blob');
  }, []);

  const downloadReport = useCallback((
    students: ReportStudentData[],
    options: ReportOptions,
    filename?: string
  ) => {
    const blob = generateReport(students, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `report_${options.tier}_${Date.now()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generateReport]);

  return {
    generateReport,
    downloadReport,
  };
}
