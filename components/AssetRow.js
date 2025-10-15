"use client";

import { useState } from "react";

export default function AssetRow({ asset }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="grid grid-cols-[180px_6fr_5fr_2fr_3fr] items-center 
                   bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 
                   hover:shadow-md transition-all duration-300 py-5 px-10"
      >
        {/* Immagine */}
        <div
          className="w-28 h-28 flex items-center justify-center cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={asset.foto_url || "/placeholder.png"}
            alt={asset.nome || asset.descrizione}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Descrizione */}
        <span className="text-left text-2xl font-medium pl-6 text-gray-900 dark:text-gray-100 flex items-center">
          {asset.descrizione}
        </span>

        {/* Note */}
        <span className="text-left text-2xl font-medium pl-6 text-gray-700 dark:text-gray-300 flex items-center">
          {asset.note || "-"}
        </span>

        {/* Quantità */}
        <span className="text-center text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
          {asset.quantita}
        </span>

        {/* Valore */}
        <span className="text-center text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center justify-center">
          {asset.valore_unitario * asset.quantita} €
        </span>
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
            alt={asset.nome || asset.descrizione}
            className="max-w-4xl max-h-[70vh] rounded-lg shadow-lg mb-6"
          />
          <span className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-lg">
            {asset.nome}
          </span>
        </div>
      )}
    </>
  );
}
