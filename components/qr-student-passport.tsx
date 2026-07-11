'use client';

import { useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRStudentPassportProps {
  studentId: string;
  name: string;
  className?: string;
}

export function QRStudentPassport({ studentId, name, className = '' }: QRStudentPassportProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = `student_${studentId}_${name}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `passport-${studentId}.png`;
    link.click();
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-sm border border-border"
      >
        <QRCodeCanvas
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-muted-foreground">Student ID:</p>
        <p className="text-sm font-mono font-bold text-foreground">{studentId}</p>
        <p className="text-xs text-muted-foreground mt-1">{name}</p>
      </div>
      <button
        onClick={handleDownload}
        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
      >
        Download QR
      </button>
    </div>
  );
}
