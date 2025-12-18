
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchAllRecords } from '@/lib/db';
import { Search, ChevronLeft, ChevronRight, QrCode, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import QrCodeDialog from '@/components/QrCodeDialog';

const RegistroBeni = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sede: '',
    stanza: '',
    dipartimento: '',
    quantita: '',
    minValue: '',
    maxValue: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'descrizione', direction: 'asc' });
  const [selectedAssetForQr, setSelectedAssetForQr] = useState(null);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);
      // Fetch ALL records using the chunking helper to bypass the 1000 limit
      const [fetchedAssets, locationsRes] = await Promise.all([
        fetchAllRecords('beni_mobili', '*', 'created_at', false),
        supabase.from('locations').select('*')
      ]);

      if (!mounted) return;

      if (locationsRes.error) throw locationsRes.error;

      setAssets(fetchedAssets || []);
      setLocations(locationsRes.data || []);

      const uniqueDepartments = [...new Set(fetchedAssets.map(a => a.dipartimento).filter(Boolean))];
      setDepartments(uniqueDepartments);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFiltersAndSort = useCallback(() => {
    let tempAssets = [...assets];

    // Search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      tempAssets = tempAssets.filter(asset =>
        Object.values(asset).some(val => 
            String(val).toLowerCase().includes(lowercasedTerm)
        )
      );
    }

    // Filters
    if (filters.sede) tempAssets = tempAssets.filter(asset => asset.sede === filters.sede);
    if (filters.dipartimento) tempAssets = tempAssets.filter(asset => asset.dipartimento === filters.dipartimento);
    if (filters.stanza) tempAssets = tempAssets.filter(asset => asset.stanza?.toLowerCase().includes(filters.stanza.toLowerCase()));
    if (filters.quantita) tempAssets = tempAssets.filter(asset => asset.quantita === parseInt(filters.quantita, 10));
    
    // Sorting
    if (sortConfig.key) {
      tempAssets.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'valore_unitario' || sortConfig.key === 'quantita') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredAssets(tempAssets);
    setCurrentPage(1);
  }, [assets, searchTerm, filters, sortConfig]);
  
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const tableHeaders = [
    { key: 'foto', label: 'Foto', sortable: false, className: "w-20" },
    { key: 'descrizione', label: 'Descrizione', sortable: true },
    { key: 'dipartimento', label: 'Dipartimento', sortable: true },
    { key: 'sede', label: 'Sede', sortable: true },
    { key: 'stanza', label: 'Stanza', sortable: true },
    { key: 'quantita', label: 'Q.tà', sortable: true},
    { key: 'valore_unitario', label: 'Valore (€)', sortable: true },
    { key: 'qr_code', label: 'QR Code', sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Registro Beni - Inventario Patrimonio+</title>
        <meta name="description" content="Consulta e gestisci tutti i beni registrati nel sistema" />
      </Helmet>
      <Layout>
        <QrCodeDialog 
            open={!!selectedAssetForQr} 
            onOpenChange={() => setSelectedAssetForQr(null)}
            asset={selectedAssetForQr}
        />
        <div className="max-w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-4xl font-bold text-foreground">Registro Beni</h1>
               <Button onClick={() => navigate('/aggiungi-bene')} className="gap-2">
                 <PlusCircle className="h-4 w-4" /> Aggiungi Bene
               </Button>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                <div className="xl:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Cerca</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cerca in tutti i campi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                    <label htmlFor="sede" className="text-sm font-medium text-muted-foreground">Sede</label>
                    <select id="sede" name="sede" value={filters.sede} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border rounded-lg">
                        <option value="">Tutte</option>
                        {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="dipartimento" className="text-sm font-medium text-muted-foreground">Dipartimento</label>
                    <select id="dipartimento" name="dipartimento" value={filters.dipartimento} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border rounded-lg">
                        <option value="">Tutti</option>
                        {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="stanza" className="text-sm font-medium text-muted-foreground">Stanza</label>
                    <input type="text" id="stanza" name="stanza" placeholder="Nome stanza..." value={filters.stanza} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                </div>
                 <div>
                    <label htmlFor="quantita" className="text-sm font-medium text-muted-foreground">Quantità</label>
                    <input type="number" id="quantita" name="quantita" placeholder="Es: 1" value={filters.quantita} onChange={handleFilterChange} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-secondary border-b">
                    <tr>
                      {tableHeaders.map(th => (
                        <th
                          key={th.key}
                          onClick={() => th.sortable && handleSort(th.key)}
                          className={`px-6 py-4 text-left text-xs font-bold text-muted-foreground tracking-wider uppercase ${th.sortable ? 'cursor-pointer hover:bg-accent' : ''} ${th.className || ''}`}
                        >
                          <div className="flex items-center gap-2">
                            {th.label}
                            {th.sortable && sortConfig.key === th.key && (
                              <span className="text-blue-500 dark:text-blue-400">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr><td colSpan={tableHeaders.length} className="px-6 py-12 text-center text-muted-foreground">Caricamento dati completi...</td></tr>
                    ) : paginatedAssets.length === 0 ? (
                      <tr><td colSpan={tableHeaders.length} className="px-6 py-12 text-center text-muted-foreground">Nessun bene trovato con i filtri attuali.</td></tr>
                    ) : (
                      paginatedAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-accent group transition-colors cursor-pointer" onClick={() => navigate(`/dettaglio-bene/${asset.id}`)}>
                          <td className="px-6 py-3">
                            <div className="h-12 w-12 rounded-lg bg-secondary border overflow-hidden flex items-center justify-center">
                              {asset.img_url ? <img src={asset.img_url} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">{asset.descrizione || '-'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{asset.dipartimento || '-'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{asset.sede || '-'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{asset.stanza || '-'}</td>
                           <td className="px-6 py-4 text-sm text-foreground font-medium">{asset.quantita || '-'}</td>
                          <td className="px-6 py-4 text-sm text-foreground font-medium">€{parseFloat(asset.valore_unitario || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssetForQr(asset);
                                }}
                                className="flex items-center gap-2 bg-secondary p-2 rounded-lg border hover:bg-background hover:border-blue-400 transition-colors"
                            >
                              <QrCode className="h-5 w-5 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between bg-card">
                  <div className="text-sm text-muted-foreground">
                    Mostrando <strong>{paginatedAssets.length}</strong> di <strong>{filteredAssets.length}</strong> risultati
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="outline" className="gap-2"><ChevronLeft className="h-4 w-4" /> Prec.</Button>
                    <span className="self-center px-2 text-sm text-muted-foreground">Pagina {currentPage} di {totalPages}</span>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="outline" className="gap-2">Succ. <ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default RegistroBeni;
