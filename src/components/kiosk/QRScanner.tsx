import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) {
      stopScanner();
    }

    try {
      setIsScanning(true);
      setError(null);

      const scanner = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false // verbose
      );

      scanner.render(
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (error: string) => {
          // Handle scan error (most are not critical)
          if (error.includes('NotFoundException')) {
            // This is normal when no QR code is in view
            return;
          }
          console.warn('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      setError('Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const restartScanner = () => {
    stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Scan Job QR Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4 text-center">
          <p className="text-gray-600 text-sm">
            Point your camera at the QR code to apply for the job
          </p>
        </div>

        {/* Scanner Container */}
        <div className="relative">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Camera className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={restartScanner}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            <div>
              <div
                id="qr-scanner-container"
                ref={elementRef}
                className="rounded-lg overflow-hidden"
              />
              
              {isScanning && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    <span className="text-sm">Scanning for QR code...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={restartScanner}
            className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart Scanner</span>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Tips:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Make sure the QR code is well-lit</li>
            <li>• Hold steady for best results</li>
            <li>• Allow camera permissions when prompted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;