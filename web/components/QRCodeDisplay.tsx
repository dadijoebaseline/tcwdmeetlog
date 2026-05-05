import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import { useRef } from 'react';

interface QRCodeDisplayProps {
  meetingId: string;
  meetingTitle: string;
  showBoth?: boolean;
}

export function QRCodeDisplay({ meetingId, meetingTitle, showBoth = false }: QRCodeDisplayProps) {
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);

  const checkInValue = JSON.stringify({
    meetingId,
    meetingTitle,
    type: 'check-in',
    timestamp: new Date().toISOString(),
  });

  const checkOutValue = JSON.stringify({
    meetingId,
    meetingTitle,
    type: 'check-out',
    timestamp: new Date().toISOString(),
  });

  const downloadQRCode = (ref: React.RefObject<HTMLDivElement>, type: 'check-in' | 'check-out') => {
    const svg = ref.current?.querySelector('svg') as SVGElement;
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `meeting-${meetingId}-${type}-qrcode.png`;
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const printQRCode = (ref: React.RefObject<HTMLDivElement>, type: 'check-in' | 'check-out') => {
    const svg = ref.current?.querySelector('svg') as SVGElement;
    if (svg) {
      const printWindow = window.open('', '', 'height=400,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
        printWindow.document.write('<div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">');
        printWindow.document.write(`<h2 style="margin-bottom: 20px;">${type === 'check-in' ? 'CHECK-IN' : 'CHECK-OUT'}</h2>`);
        printWindow.document.write(svg.outerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (showBoth) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-blue-50 rounded-lg border-2 border-blue-300">
          <h3 className="text-2xl font-bold text-blue-900">📥 CHECK-IN QR CODE</h3>
          <div ref={checkInRef} className="bg-white p-4 rounded-lg shadow-md">
            <QRCodeSVG value={checkInValue} size={256} level="H" includeMargin={true} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Meeting: {meetingTitle}</p>
            <p className="text-xs text-gray-500">Scan when entering</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => downloadQRCode(checkInRef, 'check-in')} variant="primary">
              📥 Download
            </Button>
            <Button onClick={() => printQRCode(checkInRef, 'check-in')} variant="secondary">
              🖨️ Print
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-orange-50 rounded-lg border-2 border-orange-300">
          <h3 className="text-2xl font-bold text-orange-900">📤 CHECK-OUT QR CODE</h3>
          <div ref={checkOutRef} className="bg-white p-4 rounded-lg shadow-md">
            <QRCodeSVG value={checkOutValue} size={256} level="H" includeMargin={true} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Meeting: {meetingTitle}</p>
            <p className="text-xs text-gray-500">Scan when leaving</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => downloadQRCode(checkOutRef, 'check-out')} variant="primary">
              📥 Download
            </Button>
            <Button onClick={() => printQRCode(checkOutRef, 'check-out')} variant="secondary">
              🖨️ Print
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Original single QR code display
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div ref={checkInRef} className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG value={checkInValue} size={256} level="H" includeMargin={true} />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Meeting: {meetingTitle}</p>
        <p className="text-xs text-gray-500">ID: {meetingId}</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => downloadQRCode(checkInRef, 'check-in')} variant="primary">
          📥 Download QR Code
        </Button>
        <Button onClick={() => printQRCode(checkInRef, 'check-in')} variant="secondary">
          🖨️ Print QR Code
        </Button>
      </div>
    </div>
  );
}
