
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for hash parameters in URL (Supabase puts error details in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      console.error("URL Hash Error:", error, errorDescription);
      setSessionError(decodeURIComponent(errorDescription || "Link non valido o scaduto."));
      return;
    }

    // Verify if we have a valid session.
    // The link from email should automatically sign the user in via the hash fragment.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Wait a small moment as the session might be setting up from the hash
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            setSessionError("Sessione non trovata. Il link potrebbe essere scaduto o già utilizzato.");
          }
        }, 1000);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Le password non coincidono.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password debole",
        description: "La password deve contenere almeno 6 caratteri.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password Aggiornata",
        description: "La tua password è stata modificata con successo.",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error("Update User Error:", error);
      toast({
        variant: "destructive",
        title: "Errore di aggiornamento",
        description: error.message || "Impossibile aggiornare la password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center border border-red-200 dark:border-red-900">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Link non valido</h2>
          <p className="text-muted-foreground mb-6">{sessionError}</p>
          <Button onClick={() => navigate('/forgot-password')}>
            Richiedi nuovo link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Nuova Password - Inventario Patrimonio+</title>
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card text-card-foreground rounded-2xl shadow-xl border overflow-hidden">
            <div className="bg-secondary px-8 py-6 border-b text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Imposta Nuova Password</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Inserisci la tua nuova password sicura
              </p>
            </div>

            <div className="p-8">
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">
                      Nuova Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-background"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="confirmPassword">
                      Conferma Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-background"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg font-medium shadow-md hover:shadow-lg transition-all" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Aggiornamento...
                      </div>
                    ) : (
                      'Aggiorna Password'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Password Modificata!</h3>
                  <p className="text-muted-foreground">
                    La tua password è stata aggiornata correttamente. Verrai reindirizzato al login a breve.
                  </p>
                  <Button onClick={() => navigate('/login')} className="mt-4">
                    Vai al Login ora
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
