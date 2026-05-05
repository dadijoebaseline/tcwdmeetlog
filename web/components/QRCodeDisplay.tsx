import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import { useRef } from 'react';

interface QRCodeDisplayProps {
  meetingId: string;
  meetingTitle: string;
}

export function QRCodeDisplay({ meetingId, meetingTitle }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrValue = JSON.stringify({
    meetingId,
    meetingTitle,
    timestamp: new Date().toISOString(),
  });

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg') as SVGElement;
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
        link.download = `meeting-${meetingId}-qrcode.png`;
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const printQRCode = () => {
    const svg = qrRef.current?.querySelector('svg') as SVGElement;
    if (svg) {
      const printWindow = window.open('', '', 'height=400,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
        printWindow.document.write('<div style="display: flex; justify-content: center; align-items: center; height: 100vh;">');
        printWindow.document.write(svg.outerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG value={qrValue} size={256} level="H" includeMargin={true} />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Meeting: {meetingTitle}</p>
        <p className="text-xs text-gray-500">ID: {meetingId}</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={downloadQRCode} variant="primary">
          📥 Download QR Code
        </Button>
        <Button onClick={printQRCode} variant="secondary">
          🖨️ Print QR Code
        </Button>
      </div>
    </div>
  );
}
