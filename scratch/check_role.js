const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qhsdbbumuxnenrtcmlqx.supabase.co',
  'sb_publishable_il33dK4lpoKwG7QvgxsJWQ_Uj8_MvhW'
);

async function check() {
  const { data, error } = await supabase.from('users').select('*').eq('email', 'vikrant23596@iiitd.ac.in');
  console.log("Database result:", data, error);
}

check();
