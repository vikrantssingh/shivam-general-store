import { createClient } from "@/backend/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Support - Shivam General Store",
};

export default async function ContactPage() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("shop_name, contact_number, email, store_address")
    .eq("id", 1)
    .single();

  const phone = settings?.contact_number || "9876543210";
  const email = settings?.email || "contact@shivamstore.in";
  const address = settings?.store_address || "123 Main Market, New Delhi, 110001";

  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const telHref = cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Contact & Support</h1>
        
        <div className="prose prose-green max-w-none text-gray-600 space-y-6 text-center max-w-2xl mx-auto">
          <p>
            Have a question about an order, wholesale pricing, or our products? 
            We are always here to help. Reach out to us using the contact details below.
          </p>

          <div className="bg-green-50 rounded-xl p-8 my-8 border border-green-100">
            <h3 className="text-2xl font-bold text-green-900 mb-6">Get In Touch</h3>
            
            <div className="space-y-4 text-green-800 text-lg">
              <p>
                <strong>Phone / WhatsApp:</strong><br/>
                <a href={`tel:${telHref}`} className="text-green-700 hover:underline font-semibold">
                  {phone.startsWith("+") ? phone : `+91 ${phone}`}
                </a>
              </p>
              
              <p>
                <strong>Email:</strong><br/>
                <a href={`mailto:${email}`} className="text-green-700 hover:underline font-semibold">
                  {email}
                </a>
              </p>

              {address && (
                <p>
                  <strong>Store Address:</strong><br/>
                  <span>{address}</span>
                </p>
              )}

              <p className="pt-4">
                <strong>Store Timings:</strong><br/>
                All days: 8:00 AM to 10:00 PM
              </p>
            </div>
          </div>

          <p className="text-sm">
            We usually respond to emails within 24 hours. For urgent queries, please call us directly.
          </p>
        </div>
      </div>
    </div>
  );
}
