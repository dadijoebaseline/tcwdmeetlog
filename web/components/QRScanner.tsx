'use client';

import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);
  const elementId = 'qr-reader-element';

  useEffect(() => {
    let scanner: any;

    const init = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            scanner.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {} // ignore decode errors
        );

        setStarting(false);
      } catch (err: any) {
        setError(err?.message || 'Camera access denied. Please allow camera permissions and try again.');
        setStarting(false);
      }
    };

    init();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {starting && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Starting camera…</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* The div html5-qrcode mounts into */}
          <div id={elementId} className={starting || error ? 'hidden' : ''} />

          <p className="text-xs text-gray-400 text-center mt-3">
            Point your camera at the meeting QR code
          </p>
        </div>
      </div>
    </div>
  );
}
