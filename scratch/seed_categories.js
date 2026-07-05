const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qhsdbbumuxnenrtcmlqx.supabase.co',
  'sb_publishable_il33dK4lpoKwG7QvgxsJWQ_Uj8_MvhW'
);

async function seedCategories() {
  const categories = [
    { name: 'Grocery' },
    { name: 'Beverages' },
    { name: 'Personal Care' },
    { name: 'Household' },
    { name: 'Snacks' },
    { name: 'Dairy' }
  ];

  for (const cat of categories) {
    const { data, error } = await supabase.from('categories').insert(cat).select('id');
    if (error) {
      console.error(`Error inserting ${cat.name}:`, error.message);
    } else {
      console.log(`Inserted ${cat.name} with ID: ${data[0].id}`);
    }
  }
}

seedCategories();
