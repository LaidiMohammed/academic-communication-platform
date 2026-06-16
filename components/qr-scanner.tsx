'use client';

import { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ScannedData {
  userId: string;
  name: string;
  email: string;
  membershipStatus: 'active' | 'inactive' | 'pending';
  monthlyAmount: number;
  billingCycle: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  generatedAt: string;
}

interface QRScannerProps {
  onClose: () => void;
  onScanned?: (data: ScannedData) => void;
}

export function QRScanner({ onClose, onScanned }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.');
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current || scannedData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scanQR = () => {
      if (videoRef.current && canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          try {
            const data = JSON.parse(code.data) as ScannedData;
            setScannedData(data);
            setIsScanning(false);
            onScanned?.(data);
          } catch {
            setError('Invalid QR code format');
          }
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanQR);
      }
    };

    scanQR();
  }, [isScanning, scannedData, onScanned]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Scan Member Code</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition text-foreground"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Scanner or Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!scannedData && (
            <div className="space-y-4">
              {/* Video Feed */}
              <div className="relative rounded-lg overflow-hidden bg-black aspect-square flex items-center justify-center">
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    {/* Scanning Frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-accent rounded-lg opacity-75 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white">
                    <Loader size={32} className="animate-spin mb-2" />
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Position the member's QR code within the frame. The scanner will automatically detect it.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Scanned Results */}
          {scannedData && (
            <div className="space-y-4">
              {/* Status */}
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                scannedData.membershipStatus === 'active'
                  ? 'bg-accent/10 border border-accent/30'
                  : 'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <CheckCircle
                  size={24}
                  className={scannedData.membershipStatus === 'active' ? 'text-accent' : 'text-yellow-500'}
                  strokeWidth={2}
                />
                <div>
                  <p className="font-semibold text-foreground capitalize">
                    {scannedData.membershipStatus} Member
                  </p>
                  <p className="text-xs text-muted-foreground">Valid membership</p>
                </div>
              </div>

              {/* Member Info */}
              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-lg font-semibold text-foreground">{scannedData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm text-foreground break-all">{scannedData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Member ID</p>
                  <p className="text-sm font-mono text-foreground">{scannedData.userId}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Monthly Amount</p>
                  <p className="text-lg font-bold text-primary">${scannedData.monthlyAmount.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-lg font-bold text-accent">{scannedData.billingCycle.daysRemaining}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Billing Period</p>
                  <p className="text-sm text-foreground">{scannedData.billingCycle.startDate} - {scannedData.billingCycle.endDate}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetails(!showDetails);
                }}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition font-medium"
              >
                {showDetails ? 'Hide' : 'Show'} All Details
              </button>

              {showDetails && (
                <div className="bg-background rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {JSON.stringify(scannedData, null, 2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-4 flex gap-3 bg-card sticky bottom-0">
          {scannedData ? (
            <>
              <button
                onClick={() => {
                  setScannedData(null);
                  setIsScanning(true);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium"
              >
                Scan Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition font-medium"
              >
                Close
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
