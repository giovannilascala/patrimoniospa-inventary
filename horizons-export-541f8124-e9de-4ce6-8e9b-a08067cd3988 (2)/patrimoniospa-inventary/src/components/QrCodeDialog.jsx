
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const QrCodeDialog = ({ open, onOpenChange, asset }) => {
  if (!asset) return null;

  const detailUrl = `${window.location.origin}/dettaglio-bene/${asset.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(detailUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Stampa QR Code</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            img { max-width: 100%; }
            h1 { font-size: 1.2rem; }
            p { font-size: 0.8rem; word-break: break-all; }
            .container {
              display: inline-block;
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${asset.descrizione}</h1>
            <img src="${qrCodeUrl}" alt="QR Code">
            <p><strong>QR Code:</strong> ${asset.qr_code}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code per: {asset.descrizione}</DialogTitle>
          <DialogDescription>
            Scannerizza questo codice per visualizzare i dettagli del bene.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
            <img src={qrCodeUrl} alt={`QR Code for ${asset.descrizione}`} width="250" height="250" />
          </div>
          <p className="text-sm text-gray-600 font-mono text-center break-all">
            {asset.qr_code}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Chiudi</Button>
            <Button onClick={handlePrint}>Stampa</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
