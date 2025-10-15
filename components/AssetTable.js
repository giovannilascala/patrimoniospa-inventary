"use client";

import { useEffect, useState } from "react";
import AssetRow from "./AssetRow";
import { supabase } from "@/lib/supabaseClient";

export default function AssetTable() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stanze, setStanze] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentStanza = stanze[currentIndex] || "corridoio";

  useEffect(() => {
    const fetchStanze = async () => {
      try {
        const { data, error } = await supabase
          .from("beni_mobili")
          .select("stanza")
          .order("stanza", { ascending: true });

        if (error) throw error;

        const uniqueStanze = Array.from(new Set(data.map((d) => d.stanza)));
        if (uniqueStanze.includes("corridoio")) {
          uniqueStanze.splice(uniqueStanze.indexOf("corridoio"), 1);
          uniqueStanze.unshift("corridoio");
        }

        setStanze(uniqueStanze);
      } catch (err) {
        console.error("Errore nel caricamento delle stanze:", err.message);
      }
    };

    fetchStanze();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!currentStanza) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("beni_mobili")
          .select("*")
          .eq("stanza", currentStanza)
          .order("id", { ascending: true });

        if (error) throw error;
        setAssets(data || []);
      } catch (err) {
        console.error("Errore nel caricamento dei beni:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [currentStanza]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 < stanze.length ? prev + 1 : prev));
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };
  const handleSelectChange = (e) => {
    const stanzaSelezionata = e.target.value;
    const index = stanze.findIndex((s) => s === stanzaSelezionata);
    if (index >= 0) setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 mr-40 ml-40 transition-colors duration-300 bg-gray-100 dark:bg-gray-900">
      <div className="w-full">

        {/* Titolo spostato più in basso */}
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 text-center mt-20 mb-16">
          Patrimonio Mobile – {currentStanza.charAt(0).toUpperCase() + currentStanza.slice(1)}
        </h2>

        {/* Intestazioni con stessa griglia delle righe */}
        <div className="grid grid-cols-[180px_6fr_5fr_2fr_3fr] 
                        bg-green-100 dark:bg-green-900/50 
                        text-gray-900 dark:text-gray-100 
                        font-semibold text-2xl py-6 px-10 
                        rounded-3xl mb-8 shadow-md transition-colors duration-300">
          <span></span>
          <span className="text-left pl-6">Descrizione</span>
          <span className="text-left pl-6">Note</span>
          <span className="text-center">Quantità</span>
          <span className="text-center">Valore (€)</span>
        </div>

        {loading ? (
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400">
            Caricamento in corso...
          </p>
        ) : assets.length > 0 ? (
          assets.map((asset) => <AssetRow key={asset.id} asset={asset} />)
        ) : (
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400">
            Nessun bene trovato in questa stanza.
          </p>
        )}
      </div>

      {/* Navigazione stanze */}
      <div className="flex justify-center mb-12 gap-4 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-900 dark:text-gray-100 rounded-lg text-xl font-semibold disabled:opacity-50 transition-colors duration-300"
        >
          &larr; Stanza precedente
        </button>

        <select
          value={currentStanza}
          onChange={handleSelectChange}
          className="px-6 py-3 rounded-lg border border-gray-400 dark:border-gray-600 
                     text-xl font-medium bg-white dark:bg-gray-800 
                     text-gray-800 dark:text-gray-100 transition-colors duration-300"
        >
          {stanze.map((stanza) => (
            <option key={stanza} value={stanza}>
              {stanza.charAt(0).toUpperCase() + stanza.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={handleNext}
          disabled={currentIndex === stanze.length - 1}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                     text-gray-900 dark:text-gray-100 rounded-lg text-xl font-semibold disabled:opacity-50 transition-colors duration-300"
        >
          Stanza successiva &rarr;
        </button>
      </div>
    </div>
  );
}
