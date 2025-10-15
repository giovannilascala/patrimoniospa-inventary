"use client";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mobileAssetsValue, setMobileAssetsValue] = useState(null);

  useEffect(() => {
    const fetchedValue = 125_000_000;
    setMobileAssetsValue(fetchedValue);
  }, []);

  const formatEuro = (num) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(num);

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden relative transition-colors duration-500">

      {/* Cerchio decorativo */}
      <div
        className="absolute w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full 
        bg-gradient-to-b from-blue-300/70 to-blue-100/40 dark:from-blue-900/60 dark:to-blue-700/30 
        blur-3xl shadow-[0_0_150px_60px_rgba(96,165,250,0.25)] dark:shadow-[0_0_200px_80px_rgba(30,58,138,0.4)] 
        animate-pulse"
        style={{ top: "55%", left: "50%", transform: "translate(-50%, -50%) scale(1.05)", zIndex: 0 }}
      ></div>

      {/* Contenuto */}
      <section className="relative flex flex-col items-center justify-center text-center flex-1 px-8 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-10 drop-shadow-2xl leading-tight transition-colors duration-500">
          Valore totale dei beni mobili del Comune di Messina
        </h1>

        <p className="text-7xl md:text-9xl font-extrabold text-blue-800 dark:text-blue-400 tracking-wide drop-shadow-2xl transform transition-transform duration-500 hover:scale-105">
          {formatEuro(mobileAssetsValue)}
        </p>

        <p className="mt-8 text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl drop-shadow-md leading-relaxed transition-colors duration-500">
          Questo è il valore stimato dei beni mobili del Comune di Messina. <br />
          I dati sono soggetti a verifiche ufficiali.
        </p>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 text-lg transition-colors duration-500">
        © 2025 Comune di Messina
      </footer>
    </main>
  );
}
