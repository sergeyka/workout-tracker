import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhaczmkxtkfwfbkwvts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaGFjem1reHRrZndmYmt3dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTA4NjcsImV4cCI6MjA0MjA4Njg2N30.8OMn8dGEgU60J_wKgZS30esuqjDhEx0vCIvtmXL7WoY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
