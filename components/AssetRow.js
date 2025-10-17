"use client";

import { useState } from "react";
// import QRCode from "react-qr-code";

export default function AssetRow({ asset }) {
  const [isOpen, setIsOpen] = useState(false);

  const valoreTotale = asset.valore_unitario ? asset.valore_unitario * asset.quantita : 0;

  return (
    <>
      <div
        className="grid grid-cols-[140px_3fr_3fr_2fr_2fr_2fr_2fr] items-center 
                   bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4 
                   hover:shadow-lg transition-all duration-300 py-5 px-10"
      >
        {/* Immagine */}
        <div
          className="w-24 h-24 flex items-center justify-center cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={asset.img_url || "/placeholder.png"}
            alt={asset.descrizione}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Descrizione */}
        <span className="text-left text-lg md:text-2xl font-medium pl-4 text-gray-900 dark:text-gray-100 flex items-center">
          {asset.descrizione}
        </span>

        {/* Note */}
        <span className="text-left text-lg md:text-2xl font-medium text-gray-700 dark:text-gray-300 flex items-center">
          {asset.note || "-"}
        </span>

        {/* Quantità */}
        <span className="text-center text-lg md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {asset.quantita}
        </span>

        {/* Valore */}
        <span className="text-center text-lg md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {valoreTotale} €
        </span>

        {/* Sede */}
        <span className="text-center text-lg md:text-2xl font-medium text-gray-800 dark:text-gray-200">
          {asset.sede || "-"}
        </span>

        {/* QR */}
        <div className="flex justify-center">
          {/* <QRCode value={String(asset.id)} size={60} bgColor="transparent" fgColor="#1e3a8a" /> */}
        </div>
      </div>

      {/* Immagine ingrandita */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center 
                     z-50 cursor-pointer px-4 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={asset.img_url || "/placeholder.png"}
            alt={asset.descrizione}
            className="max-w-4xl max-h-[70vh] rounded-lg shadow-lg mb-6"
          />
          <span className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
            {asset.descrizione}
          </span>
        </div>
      )}
    </>
  );
}
