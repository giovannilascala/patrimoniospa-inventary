"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AggiungiBenePage({ theme, setTheme }) {
  const [immagine, setImmagine] = useState(null);
  const [descrizione, setDescrizione] = useState("");
  const [note, setNote] = useState("");
  const [quantita, setQuantita] = useState("");
  const [valore, setValore] = useState("");
  const [stanza, setStanza] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCaricamento(true);

    try {
      let imageUrl = null;

      if (immagine) {
        // Sostituisci spazi e caratteri speciali
        const fileName = `${Date.now()}_${descrizione.trim().replace(/\s/g, "_")}`;
        console.log("Upload immagine:", fileName);

        const { error: uploadError } = await supabase.storage
          .from("img")
          .upload(fileName, immagine);

        if (uploadError) throw uploadError;

        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from("img")
          .getPublicUrl(fileName);

        if (publicUrlError) throw publicUrlError;

        imageUrl = publicUrlData.publicUrl;
        console.log("URL pubblico:", imageUrl);
      }

      // Inserimento nel database usando la colonna corretta 'img_url'
      const { error } = await supabase.from("beni_mobili").insert([
        {
          descrizione: descrizione || "Nessuna descrizione",
          note: note || "",
          quantita: parseInt(quantita) || 1,
          valore_unitario: valore ? parseFloat(valore) : 0,
          img_url: imageUrl || "",
          stanza: stanza.trim().toLowerCase() || "sconosciuta",
        },
      ]);

      if (error) throw error;

      alert("✅ Bene aggiunto con successo!");

      // Reset form
      setDescrizione("");
      setNote("");
      setQuantita("");
      setValore("");
      setStanza("");
      setImmagine(null);
    } catch (err) {
      console.error("Errore dettagliato:", err);
      alert("❌ Errore durante l'aggiunta del bene. Controlla console.");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-6 py-12 transition-colors duration-500
      ${theme === "dark" ? "bg-[#0f172a] text-gray-100" : "bg-[#F5F9FF] text-gray-800"}`}
    >
      <div
        className={`backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-3xl p-12 flex flex-col items-center
        transition-colors duration-500 ${theme === "dark" ? "bg-[rgba(30,41,59,0.6)]" : "bg-[rgba(165,216,255,.4)]"}`}
      >
        {/* Toggle tema */}
        <div className="flex w-full justify-end mb-6">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-3xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        <h1 className="text-5xl font-bold mb-10 text-center">Aggiungi un Bene</h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8 text-lg">
          {/* Immagine */}
          <div className="flex flex-col">
            <label htmlFor="immagine" className="font-semibold mb-2">📷 Foto del Bene</label>
            <input
              type="file"
              id="immagine"
              accept="image/*"
              onChange={(e) => setImmagine(e.target.files[0])}
              className="p-4 w-full border-2 rounded-2xl
                bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600
                hover:bg-gray-100 dark:hover:bg-gray-700 file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
            />
          </div>

          {/* Descrizione */}
          <div className="flex flex-col">
            <label htmlFor="descrizione" className="font-semibold mb-2">📝 Descrizione</label>
            <input
              type="text"
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              required
              placeholder="Inserisci una descrizione dettagliata del bene..."
              className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700
                focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all duration-300"
            />
          </div>

          {/* Stanza */}
          <div className="flex flex-col">
            <label htmlFor="stanza" className="font-semibold mb-2">🚪 Stanza</label>
            <input
              type="text"
              id="stanza"
              value={stanza}
              onChange={(e) => setStanza(e.target.value)}
              required
              placeholder='Inserisci il numero della stanza o "corridoio"'
              className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700
                focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all duration-300"
            />
          </div>

          {/* Note */}
          <div className="flex flex-col">
            <label htmlFor="note" className="font-semibold mb-2">🗒️ Note (facoltative)</label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Annotazioni aggiuntive..."
              className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700
                focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all duration-300"
            />
          </div>

          {/* Quantità e Valore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <label htmlFor="quantita" className="font-semibold mb-2">📦 Quantità</label>
              <input
                type="number"
                min="1"
                id="quantita"
                value={quantita}
                onChange={(e) => setQuantita(e.target.value)}
                required
                placeholder="Inserisci la quantità"
                className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600
                  bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700
                  focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all duration-300"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="valore" className="font-semibold mb-2">💰 Valore (€) (facoltativo)</label>
              <input
                type="number"
                step="0.01"
                id="valore"
                value={valore}
                onChange={(e) => setValore(e.target.value)}
                placeholder="Inserisci il valore"
                className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600
                  bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700
                  focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Pulsante */}
          <button
            type="submit"
            disabled={caricamento}
            className={`w-full mt-6 ${caricamento ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white py-4 rounded-2xl text-2xl font-semibold shadow-lg transition-all duration-300`}
          >
            {caricamento ? "⏳ Aggiunta in corso..." : "➕ Aggiungi Bene"}
          </button>
        </form>
      </div>
    </div>
  );
}
