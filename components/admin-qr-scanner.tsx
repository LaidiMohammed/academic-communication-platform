'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

interface StudentData {
  id: string;
  name: string;
  age: number;
  status: 'active' | 'inactive' | 'pending_payment';
  remainingSessions: Record<string, number>;
  specialty?: string;
  level?: string;
  paidModules?: string[];
}

interface AdminQRScannerProps {
  modules: string[];
  onScan?: (studentId: string, moduleId: string) => Promise<void>;
}

export function AdminQRScanner({ modules = [], onScan }: AdminQRScannerProps) {
  const [selectedModule, setSelectedModule] = useState<string>(modules[0] || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<StudentData | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    setError('');
    setScannedData(null);
    setSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = context.getImageData(
      0, 0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || null;
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      const qrData = captureFrame();
      if (qrData && qrData.startsWith('student_')) {
        handleQRScanned(qrData);
        stopScanning();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleQRScanned = async (qrData: string) => {
    try {
      setIsProcessing(true);
      setError('');
      setSuccess(false);

      // Extract studentId from qrData: "student_${studentId}_${name}"
      const parts = qrData.split('_');
      if (parts.length < 2) {
        setError('Invalid QR code format');
        return;
      }

      const studentId = parts[1];

      // Fetch student data
      const res = await fetch(`/api/admin/student/${studentId}`);
      if (!res.ok) {
        setError('Student not found');
        return;
      }

      const data: StudentData = await res.json();
      setScannedData(data);

      // Call onScan callback if provided
      if (onScan && selectedModule) {
        await onScan(studentId, selectedModule);
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl">
      <h3 className="text-lg font-bold text-foreground">Student QR Scanner</h3>

      {/* Module Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Select Module</label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          disabled={isScanning}
          className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition disabled:opacity-50"
        >
          {modules.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Scanner Area */}
      {!isScanning ? (
        <button
          onClick={startScanning}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          <Camera size={18} />
          Start Scanning
        </button>
      ) : (
        <>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-primary/50 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border-2 border-primary rounded-lg" />
            </div>
          </div>
          <button
            onClick={stopScanning}
            className="px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition"
          >
            Stop Scanning
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600">
          <CheckCircle2 size={16} className="shrink-0" />
          Successfully recorded session
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Processing...
        </div>
      )}

      {/* Scanned Student Info */}
      {scannedData && (
        <div className="p-4 bg-secondary/50 border border-border rounded-lg space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Student Information</p>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Name</span>
                <p className="text-sm font-bold text-foreground">{scannedData.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">ID</span>
                <p className="text-xs font-mono text-foreground">{scannedData.id}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Age</span>
                <p className="text-xs text-foreground">{scannedData.age} years</p>
              </div>
              {scannedData.level && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Level (Niveau)</span>
                  <p className="text-xs text-foreground font-semibold">{scannedData.level}</p>
                </div>
              )}
              {scannedData.specialty && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Specialty (Spécialité)</span>
                  <p className="text-xs text-foreground font-semibold">{scannedData.specialty}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Status & Payment</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Account Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  scannedData.status === 'active' ? 'bg-green-500/20 text-green-600'
                    : scannedData.status === 'inactive' ? 'bg-red-500/20 text-red-600'
                      : 'bg-orange-500/20 text-orange-600'
                }`}>
                  {scannedData.status === 'active' ? '✓ Active' : scannedData.status === 'inactive' ? '✕ Inactive' : '⏳ Pending Payment'}
                </span>
              </div>
              {scannedData.paidModules && scannedData.paidModules.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">Paid Modules</span>
                  <div className="text-right">
                    {scannedData.paidModules.map(mod => (
                      <span key={mod} className="inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mr-1 mb-0.5">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedModule && (
            <div className="border-t border-border pt-2 bg-primary/5 -mx-4 -my-0 px-4 py-2 rounded-b-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Sessions Remaining</span>
                <span className={`text-lg font-bold ${
                  (scannedData.remainingSessions[selectedModule] || 0) === 0 ? 'text-destructive' : 'text-green-600'
                }`}>
                  {scannedData.remainingSessions[selectedModule] || 0}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {(scannedData.remainingSessions[selectedModule] || 0) === 0 
                  ? '❌ No sessions available - Payment required'
                  : '✓ Student can attend sessions'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
