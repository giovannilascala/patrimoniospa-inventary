
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Euro, 
  MapPin, 
  Building, 
  Home, 
  Info, 
  Calendar, 
  Tag, 
  FileText, 
  Image as ImageIcon,
  Upload,
  Paperclip,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const DettaglioBene = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [asset, setAsset] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchAsset = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('beni_mobili')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) throw error || new Error('Asset not found');
      
      setAsset(data);
      setEditData({
        ...data,
        valore_unitario: data.valore_unitario || '',
        quantita: data.quantita || 1,
      });

    } catch (error) {
      console.error('Error fetching asset:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i dettagli del bene.",
      });
      navigate('/registro-beni');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  const fetchLocations = async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) console.error('Error fetching locations', error);
    else setLocations(data || []);
  };

  useEffect(() => {
    fetchAsset();
    fetchLocations();
  }, [fetchAsset]);

  const handleEditToggle = () => {
    if (isEditing) {
        // Reset to original data on cancel
        setEditData({
            ...asset,
            valore_unitario: asset.valore_unitario || '',
            quantita: asset.quantita || 1,
        });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = {
      ...editData,
      updated_at: new Date().toISOString(),
      utente: user?.email,
    };
    
    // Ensure numeric fields are correctly formatted
    updates.valore_unitario = parseFloat(updates.valore_unitario) || null;
    updates.quantita = parseInt(updates.quantita, 10) || null;

    const { error } = await supabase
      .from('beni_mobili')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating asset:', error);
      toast({
        variant: "destructive",
        title: "Aggiornamento fallito",
        description: "Si è verificato un errore durante l'aggiornamento.",
      });
    } else {
      toast({
        title: "Successo",
        description: "Bene aggiornato con successo.",
      });
      setIsEditing(false);
      fetchAsset(); // Re-fetch to show updated data
    }
  };
  
  const handleDelete = async () => {
    // First, delete associated files from storage
    try {
        if (asset.img_url) {
            const path = new URL(asset.img_url).pathname.split('/img/')[1];
            await supabase.storage.from('img').remove([path]);
        }
        if (asset.documenti_url && asset.documenti_url.length > 0) {
            const paths = asset.documenti_url.map(url => new URL(url).pathname.split('/documents/')[1]);
            await supabase.storage.from('documents').remove(paths);
        }
    } catch(storageError) {
        console.error('Could not delete associated files, but proceeding with DB deletion:', storageError);
    }

    const { error } = await supabase
      .from('beni_mobili')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Eliminazione fallita",
        description: "Si è verificato un errore.",
      });
    } else {
      toast({
        title: "Bene eliminato",
        description: "Il bene è stato rimosso dal registro.",
      });
      navigate('/registro-beni');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const bucket = type === 'image' ? 'img' : 'documents';
    const filePath = `${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
        toast({ variant: "destructive", title: "Upload Fallito", description: uploadError.message });
        return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

    let updatedField;
    if (type === 'image') {
        updatedField = { img_url: publicUrl };
    } else {
        const currentDocs = asset.documenti_url || [];
        updatedField = { documenti_url: [...currentDocs, publicUrl] };
    }
    
    const { error: dbError } = await supabase.from('beni_mobili').update(updatedField).eq('id', id);

    if (dbError) {
        toast({ variant: "destructive", title: "Errore Database", description: "Impossibile salvare il link del file." });
    } else {
        toast({ title: "Successo", description: "File caricato e salvato." });
        fetchAsset();
    }
  };

  const handleFileDelete = async (fileUrl, type) => {
    const bucket = type === 'image' ? 'img' : 'documents';
    const path = new URL(fileUrl).pathname.split(`/${bucket}/`)[1];
    
    const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
    
    if (storageError) {
        toast({ variant: "destructive", title: "Errore eliminazione file", description: storageError.message });
        return;
    }
    
    let updatedField;
    if (type === 'image') {
        updatedField = { img_url: null };
    } else {
        const updatedDocs = asset.documenti_url.filter(url => url !== fileUrl);
        updatedField = { documenti_url: updatedDocs };
    }

    const { error: dbError } = await supabase.from('beni_mobili').update(updatedField).eq('id', id);
    
    if (dbError) {
        toast({ variant: "destructive", title: "Errore Database", description: "Impossibile aggiornare il record." });
    } else {
        toast({ title: "Successo", description: "File eliminato." });
        fetchAsset();
    }
};

  const detailItems = useMemo(() => [
    { icon: Package, label: 'Quantità', value: asset?.quantita, key: 'quantita', type: 'number' },
    { icon: Euro, label: 'Valore Unitario', value: `€${parseFloat(asset?.valore_unitario || 0).toLocaleString('it-IT')}`, key: 'valore_unitario', type: 'number' },
    { icon: Tag, label: 'Codice Bilancio', value: asset?.codice_bilancio, key: 'codice_bilancio' },
    { icon: Building, label: 'Dipartimento', value: asset?.dipartimento, key: 'dipartimento' },
    { icon: MapPin, label: 'Sede', value: asset?.sede, key: 'sede', type: 'select', options: locations.map(l => l.name) },
    { icon: Home, label: 'Stanza', value: asset?.stanza, key: 'stanza' },
    { icon: Info, label: 'Stato', value: asset?.stato, key: 'stato', type: 'select', options: ['In uso', 'In magazzino', 'In manutenzione', 'Dismesso'] },
    { icon: Calendar, label: 'Data Acquisizione', value: asset?.data_acquisizione, key: 'data_acquisizione', type: 'date' },
  ], [asset, locations]);

  const renderInputField = (item) => {
    if (item.type === 'select') {
      return (
        <select name={item.key} value={editData[item.key] || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-background">
          <option value="">Seleziona...</option>
          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input
        type={item.type || 'text'}
        name={item.key}
        value={editData[item.key] || ''}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border rounded-lg bg-background"
      />
    );
  };
  
  if (loading) {
    return <Layout><div className="flex justify-center items-center h-64">Caricamento...</div></Layout>;
  }

  if (!asset) {
    return <Layout><div className="text-center py-10">Bene non trovato.</div></Layout>;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Modifica' : 'Dettaglio'} Bene: {asset.descrizione} - Inventario</title>
        <meta name="description" content={`Dettagli per il bene ${asset.descrizione}`} />
      </Helmet>
      <Layout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate('/registro-beni')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Torna al Registro
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleEditToggle} variant={isEditing ? 'outline' : 'default'} className="gap-2">
                  {isEditing ? <XCircle className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {isEditing ? 'Annulla' : 'Modifica'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Elimina</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro di voler eliminare?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione è irreversibile. Il bene e tutti i file associati verranno eliminati permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Main Content */}
            <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Image & Docs */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Image */}
                        <div className="bg-card p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><ImageIcon className="text-blue-500" />Immagine</h3>
                            <div className="w-full aspect-square rounded-lg bg-secondary border-2 border-dashed flex items-center justify-center overflow-hidden mb-4">
                                {asset.img_url ? (
                                    <div className="relative group w-full h-full">
                                        <img src={asset.img_url} alt={asset.descrizione} className="w-full h-full object-cover" />
                                        <button onClick={() => handleFileDelete(asset.img_url, 'image')} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : <p className="text-muted-foreground">Nessuna immagine</p>}
                            </div>
                            <label className="w-full">
                                <span className="flex items-center justify-center gap-2 px-4 py-2 bg-background border rounded-lg cursor-pointer hover:bg-secondary text-sm font-medium">
                                    <Upload className="h-4 w-4"/> {asset.img_url ? 'Sostituisci Immagine' : 'Carica Immagine'}
                                </span>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
                            </label>
                        </div>
                        {/* Documents */}
                        <div className="bg-card p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><FileText className="text-green-500" />Documenti</h3>
                            <div className="space-y-3 mb-4">
                                {(asset.documenti_url && asset.documenti_url.length > 0) ? (
                                    asset.documenti_url.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded-lg border">
                                            <a href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                                                <Paperclip className="h-4 w-4" />
                                                <span className="truncate">{doc.split('/').pop().substring(14)}</span>
                                            </a>
                                            <button onClick={() => handleFileDelete(doc, 'document')} className="p-1 text-red-500 hover:text-red-700">
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-muted-foreground">Nessun documento allegato.</p>}
                            </div>
                            <label className="w-full">
                                <span className="flex items-center justify-center gap-2 px-4 py-2 bg-background border rounded-lg cursor-pointer hover:bg-secondary text-sm font-medium">
                                    <Upload className="h-4 w-4"/> Aggiungi Documento
                                </span>
                                <input type="file" onChange={(e) => handleFileUpload(e, 'document')} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 bg-card p-8 rounded-xl shadow-sm border">
                        {isEditing ? (
                            <>
                                <label className="block text-sm font-medium text-muted-foreground">Descrizione</label>
                                <input name="descrizione" value={editData.descrizione || ''} onChange={handleInputChange} className="text-3xl font-bold text-foreground bg-transparent w-full mb-4 border-b-2 pb-2" />
                                <label className="block text-sm font-medium text-muted-foreground mt-4">Note</label>
                                <textarea name="note" value={editData.note || ''} onChange={handleInputChange} rows="3" className="w-full text-muted-foreground border rounded-lg p-2 bg-background" />
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold text-foreground mb-2">{asset.descrizione}</h1>
                                <p className="text-muted-foreground mb-8">{asset.note || "Nessuna nota aggiuntiva."}</p>
                            </>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                            {detailItems.map((item) => (
                                <div key={item.key} className="flex items-start gap-4">
                                    <div className="mt-1 bg-secondary p-2 rounded-lg"><item.icon className="h-5 w-5 text-muted-foreground" /></div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        {isEditing ? renderInputField(item) : <p className="text-lg font-semibold text-foreground">{item.value || '-'}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <div className="mt-8 flex justify-end">
                                <Button type="submit" className="gap-2"><Edit className="h-4 w-4" /> Salva Modifiche</Button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </motion.div>
      </Layout>
    </>
  );
};

export default DettaglioBene;
