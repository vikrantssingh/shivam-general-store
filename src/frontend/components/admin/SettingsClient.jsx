"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { updateStoreSettingsAction } from "@/backend/actions/admin-settings";

export default function SettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState({
    storeName: initialSettings?.shop_name ?? "SHIVAM GENERAL STORE",
    phone: initialSettings?.contact_number ?? "9876543210",
    email: initialSettings?.email ?? "contact@shivamstore.in",
    address: initialSettings?.store_address ?? "123 Main Market, New Delhi, 110001",
    homeDeliveryEnabled: true,
    storePickupEnabled: true,
    deliveryCharge: "40",
    minOrderForFreeDelivery: "500",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleToggle = (name) => {
    setSettings({ ...settings, [name]: !settings[name] });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateStoreSettingsAction({
        storeName: settings.storeName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
      });

      if (res?.error) {
        toast.error(res.error || "Failed to update settings");
      } else {
        toast.success("Store settings updated successfully!");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Something went wrong while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business profile and delivery configurations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 font-bold text-white shadow-sm transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">Business Profile</CardTitle>
            <CardDescription>Public information displayed on the website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input 
                name="storeName" 
                value={settings.storeName} 
                onChange={handleChange} 
                placeholder="Store Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                name="phone" 
                value={settings.phone} 
                onChange={handleChange} 
                placeholder="Phone Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                name="email" 
                value={settings.email} 
                onChange={handleChange} 
                placeholder="Email Address"
              />
            </div>
            <div className="space-y-2">
              <Label>Store Address</Label>
              <Input 
                name="address" 
                value={settings.address} 
                onChange={handleChange} 
                placeholder="Store Address"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">Delivery & Operations</CardTitle>
            <CardDescription>Configure how customers receive their orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Home Delivery</Label>
                <p className="text-sm text-gray-500">Allow customers to get orders delivered.</p>
              </div>
              <Switch 
                checked={settings.homeDeliveryEnabled}
                onCheckedChange={() => handleToggle('homeDeliveryEnabled')}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Store Pickup</Label>
                <p className="text-sm text-gray-500">Allow customers to pickup from the shop.</p>
              </div>
              <Switch 
                checked={settings.storePickupEnabled}
                onCheckedChange={() => handleToggle('storePickupEnabled')}
              />
            </div>

            {settings.homeDeliveryEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Delivery Charge (₹)</Label>
                  <Input 
                    type="number" 
                    name="deliveryCharge" 
                    value={settings.deliveryCharge} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free Delivery Above (₹)</Label>
                  <Input 
                    type="number" 
                    name="minOrderForFreeDelivery" 
                    value={settings.minOrderForFreeDelivery} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
