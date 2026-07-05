const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qhsdbbumuxnenrtcmlqx.supabase.co',
  'sb_publishable_il33dK4lpoKwG7QvgxsJWQ_Uj8_MvhW'
);

async function testSignup() {
  const randomEmail = `test_${Math.floor(Math.random() * 10000)}@shivam.com`;
  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User',
        role: 'retail'
      }
    }
  });
  
  console.log("Email:", randomEmail);
  console.log("Error details:", JSON.stringify(error, null, 2));
}

testSignup();
