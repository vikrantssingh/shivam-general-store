import { createClient } from "@/backend/supabase/server";
import SettingsClient from "@/frontend/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createClient();

  const { data: settings, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching settings:", error);
  }

  return <SettingsClient initialSettings={settings} />;
}
