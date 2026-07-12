'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Printer, ArrowLeft, CheckCircle2, GraduationCap, Download } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptData {
  receiptNumber: string;
  paymentId: string;
  checkoutId: string;
  invoiceId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  planTitle: string;
  level: string;
  subjects: { id: string; ar: string }[];
  status: string;
  paidAt: string | null;
  createdAt: string;
  student: { name: string; email: string; school: string };
  school: {
    name: string; nameLatin: string; address: string; addressLatin: string;
    phone: string; email: string; website: string; motto: string; since: string;
  };
}

export default function ReceiptPage() {
  const params = useParams();
  const paymentId = params?.paymentId as string;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paymentId) return;
    const isTest = paymentId.startsWith('test-');
    let url = `/api/payments/receipt?paymentId=${paymentId}`;
    if (isTest) {
      const stored = sessionStorage.getItem('testReceipt');
      if (stored) {
        const p = JSON.parse(stored);
        url += `&amount=${p.amount}&level=${encodeURIComponent(p.level)}&subjects=${encodeURIComponent(JSON.stringify(p.subjects))}&planTitle=${encodeURIComponent(p.planTitle)}&studentName=${encodeURIComponent(p.studentName)}`;
      }
    }
    fetch(url)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load receipt'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data?.receiptNumber || 'receipt'}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-semibold">{error || 'Receipt not found'}</p>
          <Link href="/dashboard/membership" className="text-blue-400 hover:underline text-sm">Back to Membership</Link>
        </div>
      </div>
    );
  }

  const paidAt = data.paidAt ? new Date(data.paidAt) : null;
  const paidDate = paidAt ? paidAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const paidTime = paidAt ? paidAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b print:hidden">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard/membership" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg">
              <Download size={16} /> Save PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-lg">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* ── Receipt ── */}
      <div ref={receiptRef} className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 text-white print:bg-white print:text-gray-900 print:border-b-2 print:border-gray-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap size={28} className="text-blue-200 print:text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight print:text-gray-900">{data.school.name}</h1>
                    <p className="text-sm text-blue-200 print:text-gray-500 font-medium">{data.school.nameLatin}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-200/80 print:text-gray-400 mt-1 leading-relaxed">
                  {data.school.addressLatin}<br />
                  {data.school.phone} · {data.school.email}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-wider print:text-gray-800">{data.receiptNumber}</div>
                <p className="text-xs text-blue-200 print:text-gray-400 mt-1">Payment Receipt</p>
              </div>
            </div>
          </div>

          {/* Paid stamp */}
          <div className="px-8 py-4 bg-green-50 print:bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span className="text-sm font-bold text-green-700">Payment Completed</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">ID: {data.paymentId.slice(0, 8)}</span>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Date/Time */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Payment Date</p>
                <p className="text-lg font-bold text-gray-900">{paidDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Payment Time</p>
                <p className="text-lg font-bold text-gray-900">{paidTime}</p>
              </div>
            </div>

            {/* Student Info */}
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Student Information</p>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-bold text-gray-900">{data.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm text-gray-900">{data.student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">School</span>
                  <span className="text-sm text-gray-900">{data.student.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Level</span>
                  <span className="text-sm font-semibold text-gray-900">{data.level}</span>
                </div>
              </div>
            </div>

            {/* Subjects / Modules */}
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Modules / Subjects</p>
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">#</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">Subject</th>
                      <th className="text-right p-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subjects.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="p-4 text-gray-400">{i + 1}</td>
                        <td className="p-4 font-medium text-gray-900">{s.ar}</td>
                        <td className="p-4 text-right font-medium text-gray-900">
                          {data.subjects.length > 1 ? '—' : new Intl.NumberFormat('ar-DZ').format(data.amount) + ' د.ج'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Paid</p>
                <p className="text-xs text-gray-400 mt-0.5">via {data.paymentMethod === 'chargily' ? 'Chargily Pay (EDAHABIA / CIB)' : data.paymentMethod}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-blue-700">
                  {data.amount.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm font-semibold text-blue-500 mr-1">د.ج</span>
              </div>
            </div>

            {/* Invoice reference */}
            {data.invoiceId && (
              <div className="text-center text-xs text-gray-400">
                Invoice: {data.invoiceId} · Checkout: {data.checkoutId?.slice(0, 12)}...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-8 py-6 text-center">
            <p className="text-xs text-gray-400 italic">{data.school.motto}</p>
            <p className="text-xs text-gray-400 mt-2">
              {data.school.nameLatin} · {data.school.address} · {data.school.phone} · {data.school.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Receipt {data.receiptNumber} · Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-300">
              <span>{data.school.website}</span>
              <span>·</span>
              <span>Since {data.school.since}</span>
              <span>·</span>
              <span>Oran, Algeria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
