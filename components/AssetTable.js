"use client";

import { useEffect, useState } from "react";
import AssetRow from "./AssetRow";
import { supabase } from "@/lib/supabaseClient";

export default function AssetTable() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stanza: "",
    dipartimento: "",
    sede: "",
  });
  const [options, setOptions] = useState({
    stanze: [],
    dipartimenti: [],
    sedi: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔹 Recupera tutte le opzioni uniche per filtri
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data, error } = await supabase.from("beni_mobili").select("stanza, dipartimento, sede");
        if (error) throw error;

        const stanze = [...new Set(data.map((d) => d.stanza).filter(Boolean))];
        const dipartimenti = [...new Set(data.map((d) => d.dipartimento).filter(Boolean))];
        const sedi = [...new Set(data.map((d) => d.sede).filter(Boolean))];

        setOptions({ stanze, dipartimenti, sedi });
      } catch (err) {
        console.error("Errore nel caricamento delle opzioni:", err.message);
      }
    };

    fetchOptions();
  }, []);

  // 🔹 Caricamento beni filtrati
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        let query = supabase.from("beni_mobili").select("*").order("id", { ascending: true });

        if (filters.stanza) query = query.eq("stanza", filters.stanza);
        if (filters.dipartimento) query = query.eq("dipartimento", filters.dipartimento);
        if (filters.sede) query = query.eq("sede", filters.sede);

        const { data, error } = await query;
        if (error) throw error;
        setAssets(data || []);
        setCurrentPage(1); // reset pagina ogni volta che cambia un filtro
      } catch (err) {
        console.error("Errore nel caricamento dei beni:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [filters]);

  // 🔹 Gestione paginazione
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAssets = assets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assets.length / itemsPerPage);

  // 🔹 Gestione cambi filtro
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 md:mx-40 transition-colors duration-300 bg-gray-100 dark:bg-gray-900">
      <div className="w-full">

        {/* 🔹 Filtri */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 py-6">
          <select
            name="stanza"
            value={filters.stanza}
            onChange={handleFilterChange}
            className="px-6 py-3 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl font-medium text-gray-800 dark:text-gray-100"
          >
            <option value="">Tutte le stanze</option>
            {options.stanze.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            name="dipartimento"
            value={filters.dipartimento}
            onChange={handleFilterChange}
            className="px-6 py-3 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl font-medium text-gray-800 dark:text-gray-100"
          >
            <option value="">Tutti i dipartimenti</option>
            {options.dipartimenti.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            name="sede"
            value={filters.sede}
            onChange={handleFilterChange}
            className="px-6 py-3 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl font-medium text-gray-800 dark:text-gray-100"
          >
            <option value="">Tutte le sedi</option>
            {options.sedi.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* 🔹 Intestazione */}
        <div className="grid grid-cols-[140px_3fr_3fr_2fr_2fr_2fr_2fr] 
                        bg-green-100 dark:bg-green-900/50 
                        text-gray-900 dark:text-gray-100 
                        font-semibold text-xl md:text-2xl py-6 px-10 
                        rounded-3xl mb-8 shadow-md transition-colors duration-300">
          <span></span>
          <span className="text-left">Descrizione</span>
          <span className="text-left">Note</span>
          <span className="text-center">Quantità</span>
          <span className="text-center">Valore (€)</span>
          <span className="text-center">Sede</span>
          <span className="text-center">QR</span>
        </div>

        {/* 🔹 Righe */}
        {loading ? (
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400">Caricamento...</p>
        ) : currentAssets.length > 0 ? (
          currentAssets.map((asset) => <AssetRow key={asset.id} asset={asset} />)
        ) : (
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400">
                Nessun bene trovato.
          </p>
        )}
      </div>

      {/* 🔹 Paginazione */}
      <div className="flex justify-center mt-12 gap-4 mb-16">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-900 dark:text-gray-100 rounded-lg text-xl font-semibold disabled:opacity-50"
        >
          ← Precedente
        </button>

        <span className="text-gray-700 dark:text-gray-300 text-xl font-medium my-auto">
          Pagina {currentPage} di {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-900 dark:text-gray-100 rounded-lg text-xl font-semibold disabled:opacity-50"
        >
          Successiva →
        </button>
      </div>
    </div>
  );
}
