
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { fetchAllRecords, getCount } from '@/lib/db';
import { 
  Package, 
  Euro, 
  CheckCircle, 
  Wrench, 
  PlusCircle, 
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    totalValue: 0,
    assetsInUse: 0,
    assetsInMaintenance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMetrics = async () => {
      try {
        // Run independent queries in parallel for performance
        const [
          totalAssets,
          assetsInUse,
          assetsInMaintenance,
          allAssetsForValue
        ] = await Promise.all([
          getCount('beni_mobili'),
          getCount('beni_mobili', { stato: 'In uso' }),
          getCount('beni_mobili', { stato: 'In manutenzione' }),
          fetchAllRecords('beni_mobili', 'valore_unitario, quantita')
        ]);

        if (!mounted) return;

        // Calculate total value locally from the full dataset
        const totalValue = allAssetsForValue.reduce((sum, asset) => {
          const qty = parseInt(asset.quantita, 10) || 1;
          const val = parseFloat(asset.valore_unitario) || 0;
          return sum + (val * qty);
        }, 0);

        setMetrics({
          totalAssets: totalAssets || 0,
          totalValue,
          assetsInUse: assetsInUse || 0,
          assetsInMaintenance: assetsInMaintenance || 0
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMetrics();

    return () => {
      mounted = false;
    };
  }, []);

  const metricCards = [
    {
      title: 'Beni Totali',
      value: metrics.totalAssets,
      icon: Package,
      color: 'bg-blue-500',
      trend: '+12% dal mese scorso'
    },
    {
      title: 'Valore Totale',
      value: `€${metrics.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      icon: Euro,
      color: 'bg-green-500',
      trend: '+8% dal mese scorso'
    },
    {
      title: 'Beni in Uso',
      value: metrics.assetsInUse,
      icon: CheckCircle,
      color: 'bg-purple-500',
      trend: `${metrics.totalAssets > 0 ? ((metrics.assetsInUse / metrics.totalAssets) * 100).toFixed(0) : 0}% del totale`
    },
    {
      title: 'In Manutenzione',
      value: metrics.assetsInMaintenance,
      icon: Wrench,
      color: 'bg-orange-500',
      trend: `${metrics.totalAssets > 0 ? ((metrics.assetsInMaintenance / metrics.totalAssets) * 100).toFixed(0) : 0}% del totale`
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Inventario Patrimonio+</title>
        <meta name="description" content="Dashboard principale del sistema di gestione inventario" />
      </Helmet>
      <Layout>
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-lg text-muted-foreground">Benvenuto nel sistema di gestione inventario</p>
          </motion.div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card text-card-foreground rounded-xl shadow-sm border p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.color} p-3 rounded-lg shadow-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-green-100 dark:bg-green-500/20 p-1.5 rounded-full">
                       <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-foreground mb-2">
                    {loading ? '...' : card.value}
                  </p>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-full">
                        {card.trend.split(' ')[0]}
                     </span>
                     <span className="text-xs text-muted-foreground">
                        {card.trend.substring(card.trend.indexOf(' '))}
                     </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/aggiungi-bene" className="block group">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-card text-card-foreground rounded-xl shadow-sm border p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                     <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-xl">
                        <PlusCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                     </div>
                     <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Aggiungi Nuovo Bene
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Registra un nuovo bene nel sistema, carica foto e documenti, e assegna un codice QR univoco.
                  </p>
                </motion.div>
              </Link>

              <Link to="/registro-beni" className="block group">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-card text-card-foreground rounded-xl shadow-sm border p-6 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all h-full flex flex-col"
                >
                   <div className="flex items-start justify-between mb-4">
                     <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-xl">
                        <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                     </div>
                     <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Visualizza Registro
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Consulta l'elenco completo dei beni, filtra per categoria o sede, e gestisci le assegnazioni.
                  </p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
