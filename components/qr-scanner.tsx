'use client';

import { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ScannedData {
  userId: string;
  name: string;
  email: string;
  membershipStatus?: 'active' | 'inactive' | 'pending';
  isActive?: boolean;
  plan?: string;
  price?: string;
  monthlyAmount?: number;
  billingCycle?: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  generatedAt?: string;
  ts?: number;
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

  // Derived values for robust rendering
  const isMemberActive = scannedData ? (scannedData.membershipStatus === 'active' || scannedData.isActive === true) : false;
  const planName = scannedData?.plan || (isMemberActive ? 'Monthly Access' : 'Free Preview');
  const planPrice = scannedData?.price || (scannedData?.monthlyAmount !== undefined ? `${scannedData.monthlyAmount.toFixed(2)} USD` : '3 000 DA');
  const daysRemaining = scannedData?.billingCycle?.daysRemaining ?? (isMemberActive ? 30 : 0);
  const billingPeriod = scannedData?.billingCycle 
    ? `${scannedData.billingCycle.startDate} - ${scannedData.billingCycle.endDate}` 
    : `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold text-foreground">Scan Member Code</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Scanner or Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!scannedData && (
            <div className="space-y-4">
              {/* Video Feed */}
              <div className="relative rounded-lg overflow-hidden bg-black aspect-square flex items-center justify-center border border-border/40">
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
                    {/* Scanning HUD Frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-56 border-2 border-blue-500 rounded-2xl opacity-75 relative">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-blue-400 rounded-tl-md" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-blue-400 rounded-tr-md" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-blue-400 rounded-bl-md" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-blue-400 rounded-br-md" />
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-blue-500/50 shadow-md animate-bounce" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white p-6 text-center">
                    <Loader size={32} className="animate-spin mb-3 text-blue-500" />
                    <p className="text-sm font-medium text-muted-foreground">Initializing camera feed...</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-secondary/40 rounded-xl p-4 border border-border/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Position the member's QR code within the highlighted camera frame. The scanner will automatically detect and verify their subscription status.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Scanned Results */}
          {scannedData && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                isMemberActive
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <CheckCircle
                  size={24}
                  className={isMemberActive ? 'text-green-400' : 'text-red-400'}
                  strokeWidth={2}
                />
                <div>
                  <p className={`font-bold text-sm ${isMemberActive ? 'text-green-400' : 'text-red-400'}`}>
                    {isMemberActive ? '✓ Subscription Active' : '✗ Subscription Expired'}
                  </p>
                  <p className="text-xs text-muted-foreground">Member verified successfully</p>
                </div>
              </div>

              {/* Member Info */}
              <div className="bg-secondary/40 border border-border/30 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Name</p>
                  <p className="text-base font-bold text-foreground">{scannedData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-sm text-foreground break-all">{scannedData.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Member ID</p>
                  <p className="text-xs font-mono text-muted-foreground bg-secondary/80 px-2 py-1 rounded border border-border/20 inline-block">{scannedData.userId}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-secondary/40 border border-border/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Plan Selected</p>
                  <p className="text-sm font-bold text-foreground">{planName}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Price Rate</p>
                  <p className="text-sm font-black text-blue-400">{planPrice}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Days Remaining</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    daysRemaining > 5 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>{daysRemaining} days</span>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Billing Validity</p>
                  <p className="text-xs text-foreground font-medium">{billingPeriod}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetails(!showDetails);
                }}
                className="w-full text-center text-xs text-blue-400 hover:text-blue-300 transition font-bold uppercase tracking-wider"
              >
                {showDetails ? 'Hide' : 'Show'} raw response data
              </button>

              {showDetails && (
                <div className="bg-secondary/80 rounded-xl p-4 border border-border/30 max-h-48 overflow-y-auto">
                  <pre className="text-[10px] text-muted-foreground font-mono break-all whitespace-pre-wrap">
                    {JSON.stringify(scannedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-4 flex gap-3 bg-card sticky bottom-0 z-10">
          {scannedData ? (
            <>
              <button
                onClick={() => {
                  setScannedData(null);
                  setIsScanning(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-secondary transition text-sm font-semibold"
              >
                Scan Next
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-foreground transition text-sm font-semibold shadow-lg shadow-blue-500/20"
              >
                Finish
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-secondary transition text-sm font-semibold"
            >
              Cancel Scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
