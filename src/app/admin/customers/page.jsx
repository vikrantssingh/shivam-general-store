import { createClient } from "@/backend/supabase/server";
import CustomersClient from "@/frontend/components/admin/CustomersClient";

export default async function AdminCustomersPage() {
  const supabase = createClient();
  
  // Fetch all users except admin
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <CustomersClient users={users || []} />
  );
}
