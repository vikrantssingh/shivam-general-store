const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qhsdbbumuxnenrtcmlqx.supabase.co',
  'sb_publishable_il33dK4lpoKwG7QvgxsJWQ_Uj8_MvhW'
);

async function checkDB() {
  const { data: users, error: uErr } = await supabase.from('users').select('id').limit(1);
  console.log("Users table check:", uErr ? uErr.message : "Exists!");
}

checkDB();
