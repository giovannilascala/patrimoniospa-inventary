"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("light");

  // Carica tema da localStorage all'avvio
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
  }, []);

  // Applica tema all'html e salva su localStorage
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <html lang="it">
      <body className="transition-colors duration-500 bg-[#F5F9FF] dark:bg-[#0f172a]">
        <Navbar theme={theme} setTheme={setTheme} />
        {children}
      </body>
    </html>
  );
}
