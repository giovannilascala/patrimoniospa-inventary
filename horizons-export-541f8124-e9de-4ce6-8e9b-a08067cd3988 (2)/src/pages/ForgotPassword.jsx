
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ensure we use the origin correctly. 
    // This resolves to something like "http://localhost:3000" or "https://my-app.com"
    const origin = window.location.origin;
    const redirectUrl = `${origin}/reset-password`;

    console.log("Attempting password reset for:", email);
    console.log("Redirect URL:", redirectUrl);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Supabase Reset Password Error:", error);
        // Specifically handle 404-like network errors if they occur, though typically Supabase returns standard error objects
        if (error.status === 404) {
          throw new Error("Servizio di autenticazione non raggiungibile. Riprova più tardi.");
        }
        throw error;
      }

      console.log("Password reset email sent successfully", data);
      setSubmitted(true);
      toast({
        title: "Email inviata",
        description: `Un link di reset è stato inviato a ${email}.`,
      });
      
    } catch (error) {
      console.error("Catch Error:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile inviare l'email. Verifica l'indirizzo e riprova.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recupero Password - Inventario Patrimonio+</title>
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
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Recupero Password</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {submitted 
                  ? "Email inviata con successo!" 
                  : "Inserisci la tua email per ricevere il link di reset"}
              </p>
            </div>

            <div className="p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="email">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-background"
                        placeholder="nome@esempio.com"
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
                        Invio in corso...
                      </div>
                    ) : (
                      'Invia Link di Reset'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-start gap-3 text-left">
                    <div className="mt-1"><Mail className="h-5 w-5" /></div>
                    <div>
                      Controlla <strong>{email}</strong>. Se l'indirizzo è registrato, riceverai un link per impostare una nuova password.
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Attenzione: Il link scade dopo un breve periodo.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSubmitted(false)}
                    className="w-full"
                  >
                    Riprova con un'altra email
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-secondary px-8 py-4 border-t text-center">
              <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Torna al Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
