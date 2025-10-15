"use client";

import AssetTable from "@/components/AssetTable";

export default function HomePage() {

  return (
    <div className="min-h-screen flex flex-col">
      {/* Titolo della tabella */}
      <h2 className="text-5xl md:text-6xl font-bold text-gray-900  dark:text-gray-100  text-center mb-8 mt-45">
        Patrimonio Mobile del Comune di Messina
      </h2>

      <AssetTable />


    </div>
  );
}
