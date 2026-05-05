'use client';

import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [status, setStatus] = useState<'starting' | 'active' | 'error'>('starting');
  const [error, setError] = useState('');
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    mountedRef.current = true;
    let scanner: any;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mountedRef.current) return;

        scanner = new Html5Qrcode('qr-reader-div');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (text: string) => {
            if (!mountedRef.current) return;
            scanner.stop().catch(() => {}).finally(() => {
              if (mountedRef.current) onScanRef.current(text);
            });
          },
          () => {} // per-frame decode errors are normal — ignore them
        );

        if (mountedRef.current) setStatus('active');
      } catch (e: any) {
        if (mountedRef.current) {
          setStatus('error');
          setError(e?.message ?? 'Camera error. Check permissions and try again.');
        }
      }
    };

    start();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl leading-none px-1"
          >
            ×
          </button>
        </div>

        <div className="p-4 relative">
          {/*
            IMPORTANT: This div must always be in the DOM and visible with real dimensions.
            html5-qrcode measures its width/height to size the camera viewport —
            hiding it (display:none) causes it to silently fail.
          */}
          <div id="qr-reader-div" style={{ width: '100%', minHeight: 300 }} />

          {/* Loading overlay */}
          {status === 'starting' && (
            <div className="absolute inset-4 flex flex-col items-center justify-center gap-3 bg-white rounded-lg">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Starting camera…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="absolute inset-4 flex items-center justify-center">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center w-full">
                {error}
              </div>
            </div>
          )}
        </div>

        {status === 'active' && (
          <p className="text-xs text-gray-400 text-center pb-4">
            Point camera at the meeting QR code
          </p>
        )}
      </div>
    </div>
  );
}

