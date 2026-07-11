import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AttendanceModule {
  module: string;
  teacher: string;
  attended: number;
  remaining: number;
}

interface ReportStudentData {
  name: string;
  email: string;
  phone: string;
  age: number | string;
  status: string;
  paymentStatus: string;
  totalPaid: number;
  attendanceByModule: AttendanceModule[];
}

interface ReportOptions {
  tier: string;
  modules: string[];
  generatedAt?: string;
  generatedBy?: string;
  month?: string;
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
    doc.text('Bendella School - Monthly Student Report', margin, margin + 5);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const generatedAt = options.generatedAt || new Date().toLocaleString();
    const generatedBy = options.generatedBy || 'Admin';
    const reportMonth = options.month || new Date().toISOString().slice(0, 7);
    doc.text(`Tier: ${options.tier}  |  Month: ${reportMonth}`, margin, margin + 15);
    doc.text(`Generated: ${generatedAt} by ${generatedBy}`, margin, margin + 20);

    // Table data
    const tableData = students.map(student => {
      const row = [
        student.name,
        student.email,
        student.phone,
        typeof student.age === 'number' ? student.age.toString() : student.age || 'N/A',
        student.status,
        student.paymentStatus,
        `${student.totalPaid} DA`,
      ];
      options.modules.forEach(m => {
        const modData = student.attendanceByModule.find(a => a.module === m);
        row.push(modData?.teacher || '—');
        row.push(String(modData?.attended || 0));
        row.push(String(modData?.remaining || 0));
      });
      return row;
    });

    // Table headers
    const headers = ['Name', 'Email', 'Phone', 'Age', 'Status', 'Payment', 'Total Paid'];
    options.modules.forEach(m => {
      headers.push(`${m} (Teacher)`, `${m} (Attended)`, `${m} (Remaining)`);
    });

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: margin + 25,
      margin: margin,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
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
        0: { halign: 'left', cellWidth: 30 },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'left', cellWidth: 25 },
      },
      didDrawPage: (data) => {
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

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Report ID: ${Date.now()} | Tier: ${options.tier} | Month: ${reportMonth} | Students: ${students.length}`,
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
    link.download = filename || `report_${options.tier}_${options.month || Date.now()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generateReport]);

  return {
    generateReport,
    downloadReport,
  };
}