import Header from "@/frontend/components/layout/Header";
import BottomNav from "@/frontend/components/layout/BottomNav";
import Footer from "@/frontend/components/layout/Footer";
import { createClient } from "@/backend/supabase/server";

export default async function StorefrontLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile && profile.role === 'admin') {
      isAdmin = true;
    }
  }

  // Fetch basic data for instant search suggestions
  const { data: categories } = await supabase.from('categories').select('id, name');
  const { data: products } = await supabase.from('products').select('id, name, image_url, category_id');

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16 md:pb-0">
      <Header user={user} isAdmin={isAdmin} searchData={{ categories: categories || [], products: products || [] }} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav user={user} />
    </div>
  );
}
