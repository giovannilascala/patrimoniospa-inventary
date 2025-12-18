import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxsovwdvivutrhargmtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c292d2R2aXZ1dHJoYXJnbXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMTY1NjMsImV4cCI6MjA3NTY5MjU2M30.Ii0vd13OAVge1vluJt0uBUdGaYwFdrZjsQncg1KML0M';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
