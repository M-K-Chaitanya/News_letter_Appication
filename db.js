const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('🔄 Checking database connection...');
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error.message);
      return false;
    } else {
      console.log('✅ Database connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    return false;
  }
}

module.exports = { supabase, initializeDatabase };