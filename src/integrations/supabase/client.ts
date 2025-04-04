
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hrmbywmypnaakjdkxemj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWJ5d215cG5hYWtqZGt4ZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzOTUwMDgsImV4cCI6MjA1NTk3MTAwOH0.JZsu46vX8RpaLM0LKafy-ROcr7ySUZEtS2RfXSNwCFk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    global: {
      fetch: (url, options) => fetch(url, options)
    }
  }
);
