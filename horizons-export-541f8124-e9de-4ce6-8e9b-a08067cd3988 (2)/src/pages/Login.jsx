
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Lock, Mail, Package, Loader2, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Accesso fallito",
        description: "Credenziali non valide o errore di connessione.",
      });
      setLoading(false);
    } else {
      toast({
        title: "Accesso riuscito",
        description: "Benvenuto!",
      });
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Accedi - Inventario Patrimonio+</title>
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card text-card-foreground rounded-2xl shadow-xl border overflow-hidden">
            {/* Header */}
            <div className="bg-secondary px-8 py-6 border-b text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Benvenuto</h2>
              <p className="text-sm text-muted-foreground mt-2">Accedi al sistema di gestione inventario</p>
            </div>

            {/* Form */}
            <div className="p-8">
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
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
                      Accesso...
                    </div>
                  ) : (
                    'Accedi'
                  )}
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-secondary px-8 py-4 border-t text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Sistema riservato al personale autorizzato
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
