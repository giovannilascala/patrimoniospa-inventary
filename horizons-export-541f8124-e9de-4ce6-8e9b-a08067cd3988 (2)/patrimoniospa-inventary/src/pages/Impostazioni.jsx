
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeProvider';
import { Settings, User, Lock, Sun, Moon, Bell, Download, Save } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Impostazioni = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [userData, setUserData] = useState({ full_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [notificationPrefs, setNotificationPrefs] = useState({ email_on_update: true });

  useEffect(() => {
    if (user) {
      setUserData({
        full_name: user.user_metadata?.full_name || '',
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: userData.full_name }
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Errore', description: error.message });
    } else {
      toast({ title: 'Successo', description: 'Profilo aggiornato.' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Le password non coincidono.' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast({ variant: 'destructive', title: 'Errore', description: 'La password deve essere di almeno 6 caratteri.'});
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwordData.new_password });
    if (error) {
      toast({ variant: 'destructive', title: 'Errore', description: error.message });
    } else {
      toast({ title: 'Successo', description: 'Password aggiornata. Potrebbe essere necessario effettuare nuovamente il login.' });
      setPasswordData({ new_password: '', confirm_password: '' });
    }
  };

  const handleExportData = async () => {
    const { data, error } = await supabase.from('beni_mobili').select('*');
    if (error) {
      toast({ variant: 'destructive', title: 'Export fallito', description: error.message });
      return;
    }
    if (!data || data.length === 0) {
      toast({ title: 'Nessun dato', description: 'Non ci sono beni da esportare.'});
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'export_beni_mobili.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({ title: 'Export completato', description: 'Il file CSV è stato scaricato.'});
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3"><Icon className="h-6 w-6 text-primary"/>{title}</h2>
      <div className="space-y-6">{children}</div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Impostazioni - Inventario Patrimonio+</title>
        <meta name="description" content="Gestisci le impostazioni del tuo account e dell'applicazione." />
      </Helmet>
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex items-center gap-4">
            <Settings className="h-10 w-10 text-foreground" />
            <h1 className="text-4xl font-bold text-foreground">Impostazioni</h1>
          </div>
          
          <Section title="Profilo Utente" icon={User}>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <input id="full_name" type="text" value={userData.full_name} onChange={e => setUserData({...userData, full_name: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <input id="email" type="email" value={userData.email} readOnly disabled className="mt-1 w-full px-4 py-2 border rounded-lg bg-muted cursor-not-allowed" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Salva Profilo</Button>
              </div>
            </form>
          </Section>

          <Section title="Cambia Password" icon={Lock}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="new_password">Nuova Password</Label>
                <input id="new_password" type="password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <Label htmlFor="confirm_password">Conferma Nuova Password</Label>
                <input id="confirm_password" type="password" value={passwordData.confirm_password} onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})} className="mt-1 w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Cambia Password</Button>
              </div>
            </form>
          </Section>

          <div className="grid md:grid-cols-2 gap-8">
            <Section title="Aspetto" icon={theme === 'dark' ? Moon : Sun}>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-base font-medium">Modalità Scura</Label>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
                />
              </div>
              <p className="text-sm text-muted-foreground">Passa dal tema chiaro a quello scuro per un'esperienza visiva personalizzata.</p>
            </Section>

            <Section title="Notifiche" icon={Bell}>
               <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="font-medium">Notifiche Email</Label>
                 <Switch id="email-notifications" checked={notificationPrefs.email_on_update} onCheckedChange={() => {
                   setNotificationPrefs(p => ({...p, email_on_update: !p.email_on_update}));
                   toast({ title: 'Impostazione salvata (simulata)', description: 'Le preferenze di notifica saranno presto disponibili.'});
                 }} />
              </div>
              <p className="text-sm text-muted-foreground">Ricevi aggiornamenti via email. (Funzionalità in sviluppo)</p>
            </Section>
          </div>
          
          <Section title="Esporta Dati" icon={Download}>
            <p className="text-muted-foreground">Esporta tutti i dati dei beni mobili in un file CSV. Utile per backup o analisi offline.</p>
            <div className="flex justify-end">
              <Button onClick={handleExportData} variant="secondary" className="gap-2">
                <Download className="h-4 w-4" /> Esporta in CSV
              </Button>
            </div>
          </Section>

        </motion.div>
      </Layout>
    </>
  );
};

export default Impostazioni;
