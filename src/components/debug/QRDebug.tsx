import React from 'react';

const QRDebug: React.FC = () => {
  const jobId = '53ec3742-d1d6-4990-b718-17c5f92ecb92';
  const networkIP = '192.168.43.208';
  const currentPort = '5173';
  
  const kioskUrl = `http://${networkIP}:${currentPort}/kiosk?job=${jobId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kioskUrl)}`;
  
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">QR Code Debug</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Generated URL:</h3>
          <p className="text-sm text-blue-600 break-all">{kioskUrl}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">QR Code:</h3>
          <img src={qrUrl} alt="Test QR Code" className="border p-2" />
        </div>
        
        <div>
          <h3 className="font-semibold">Test Links:</h3>
          <div className="space-y-2">
            <a 
              href="/kiosk" 
              className="block text-blue-600 hover:underline"
              target="_blank"
            >
              Test Kiosk (No Job)
            </a>
            <a 
              href={`/kiosk?job=${jobId}`} 
              className="block text-blue-600 hover:underline"
              target="_blank"
            >
              Test Kiosk (With Job)
            </a>
            <a 
              href={kioskUrl} 
              className="block text-blue-600 hover:underline"
              target="_blank"
            >
              Test Full URL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDebug;