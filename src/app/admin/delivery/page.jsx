import { createClient } from "@/backend/supabase/server";
import DeliveryClient from "@/frontend/components/admin/DeliveryClient";

export default async function AdminDeliveryPage() {
  const supabase = createClient();
  
  // Fetch settings for delivery rules
  const { data: settings, error } = await supabase
    .from("settings")
    .select("delivery_charges")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching delivery rules:", error);
  }

  const initialRules = settings?.delivery_charges || [];

  return (
    <DeliveryClient initialRules={initialRules} />
  );
}
