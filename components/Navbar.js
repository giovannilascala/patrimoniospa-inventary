"use client";
import Link from "next/link";

export default function Navbar({ theme, setTheme }) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-[rgba(96,165,250,0.2)] dark:bg-[#1e293b] shadow-lg px-8 md:px-24 py-6 md:py-12 flex items-center justify-between rounded-b-3xl z-50 transition-colors duration-500">

      <div className="text-gray-900 dark:text-gray-100 text-2xl md:text-4xl font-extrabold tracking-tight">
        Inventario<span className="text-blue-600">+</span>
      </div>

      <div className="hidden md:flex gap-12 lg:gap-20 text-gray-700 dark:text-gray-200 text-2xl md:text-4xl font-semibold">
        <Link href="/" className="hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300">Home</Link>
        <Link href="/beni" className="hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300">Registro</Link>
        <Link href="/aggiungi" className="hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300">Aggiungi bene</Link>
        <Link href="/impostazioni" className="hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300">Impostazioni</Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-3xl md:text-4xl text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
          <span className="hidden md:block text-3xl font-medium">Utente</span>
          <div className="w-15 h-15 bg-green-300 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-md">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}
