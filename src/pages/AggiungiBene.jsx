
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Upload, ArrowLeft } from 'lucide-react';

const AggiungiBene = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    descrizione: '',
    note: '',
    quantita: 1,
    valore_unitario: '',
    stanza: '',
    codice_bilancio: '',
    dipartimento: '',
    sede: '',
    stato: 'In uso',
    data_acquisizione: new Date().toISOString().split('T')[0],
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('name');
      if (!mounted) return;
      if (error) {
        console.error('Error fetching locations:', error);
      } else {
        setLocations(data || []);
      }
    };
    fetchLocations();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descrizione) {
        toast({ variant: "destructive", title: "Errore", description: "La descrizione è obbligatoria." });
        return;
    }
    
    // Validate quantity
    if (parseInt(formData.quantita, 10) < 1) {
        toast({ variant: "destructive", title: "Errore", description: "La quantità deve essere almeno 1." });
        return;
    }

    setIsSubmitting(true);

    let imageUrl = null;
    try {
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('img')
                .upload(fileName, imageFile);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('img').getPublicUrl(fileName);
            imageUrl = publicUrl;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const qrCodeContent = `PATRIMONIO-ASSET-${Date.now()}`;

        const { error: insertError } = await supabase.from('beni_mobili').insert([
            {
                ...formData,
                quantita: parseInt(formData.quantita, 10) || 1,
                valore_unitario: parseFloat(formData.valore_unitario) || null,
                img_url: imageUrl,
                qr_code: qrCodeContent,
                utente: user?.email,
            },
        ]);

        if (insertError) throw insertError;

        toast({
            title: 'Successo!',
            description: 'Nuovo bene aggiunto correttamente al registro.',
        });
        navigate('/registro-beni');
    } catch (error) {
        console.error('Error adding asset:', error);
        toast({
            variant: 'destructive',
            title: 'Errore',
            description: error.message || 'Impossibile aggiungere il bene. Riprova.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Aggiungi Bene - Inventario Patrimonio+</title>
        <meta name="description" content="Aggiungi un nuovo bene al sistema di inventario." />
      </Helmet>
      <Layout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex justify-between items-center">
             <h1 className="text-4xl font-bold text-foreground">Aggiungi Nuovo Bene</h1>
             <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Torna Indietro
             </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border space-y-8">
            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="descrizione" className="block text-sm font-medium text-muted-foreground mb-1">Descrizione del Bene *</label>
                    <input type="text" id="descrizione" name="descrizione" value={formData.descrizione} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-background" />
                </div>
                 <div>
                    <label htmlFor="quantita" className="block text-sm font-medium text-muted-foreground mb-1">Quantità</label>
                    <input type="number" id="quantita" name="quantita" value={formData.quantita} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" min="1" required/>
                </div>
            </div>
            
            <div>
                <label htmlFor="note" className="block text-sm font-medium text-muted-foreground mb-1">Note Aggiuntive</label>
                <textarea id="note" name="note" value={formData.note} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border rounded-lg bg-background"></textarea>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-8">
                <div>
                    <label htmlFor="valore_unitario" className="block text-sm font-medium text-muted-foreground mb-1">Valore Unitario (€)</label>
                    <input type="number" step="0.01" id="valore_unitario" name="valore_unitario" value={formData.valore_unitario} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                    <label htmlFor="codice_bilancio" className="block text-sm font-medium text-muted-foreground mb-1">Codice Bilancio</label>
                    <input type="text" id="codice_bilancio" name="codice_bilancio" value={formData.codice_bilancio} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                    <label htmlFor="dipartimento" className="block text-sm font-medium text-muted-foreground mb-1">Dipartimento</label>
                    <input type="text" id="dipartimento" name="dipartimento" value={formData.dipartimento} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                 <div>
                    <label htmlFor="sede" className="block text-sm font-medium text-muted-foreground mb-1">Sede</label>
                    <select id="sede" name="sede" value={formData.sede} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background">
                        <option value="">Seleziona una sede</option>
                        {locations.map(loc => <option key={loc.name} value={loc.name}>{loc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="stanza" className="block text-sm font-medium text-muted-foreground mb-1">Stanza</label>
                    <input type="text" id="stanza" name="stanza" value={formData.stanza} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                    <label htmlFor="stato" className="block text-sm font-medium text-muted-foreground mb-1">Stato</label>
                    <select id="stato" name="stato" value={formData.stato} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background">
                        <option value="In uso">In uso</option>
                        <option value="In magazzino">In magazzino</option>
                        <option value="In manutenzione">In manutenzione</option>
                        <option value="Dismesso">Dismesso</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="data_acquisizione" className="block text-sm font-medium text-muted-foreground mb-1">Data Acquisizione</label>
                    <input type="date" id="data_acquisizione" name="data_acquisizione" value={formData.data_acquisizione} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
            </div>

            {/* Image Upload */}
            <div className="border-t pt-8">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Immagine del Bene</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border bg-secondary/10">
                    <div className="space-y-1 text-center">
                        {imageFile ? (
                            <p className="text-foreground">{imageFile.name}</p>
                        ) : (
                            <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        <div className="flex text-sm text-muted-foreground justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Carica un file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                            </label>
                            <p className="pl-1">o trascina e rilascia</p>
                        </div>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF fino a 10MB</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-5">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    <PlusCircle className="h-5 w-5" />
                    {isSubmitting ? 'Salvataggio in corso...' : 'Salva Bene'}
                </Button>
            </div>
          </form>
        </motion.div>
      </Layout>
    </>
  );
};

export default AggiungiBene;
