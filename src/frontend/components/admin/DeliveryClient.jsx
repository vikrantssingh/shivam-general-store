"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDeliveryRulesAction } from "@/backend/actions/admin-delivery";
import { toast } from "sonner";
import { Plus, Trash2, Save, Info } from "lucide-react";

export default function DeliveryClient({ initialRules }) {
  const [rules, setRules] = useState(
    Array.isArray(initialRules) && initialRules.length > 0 
      ? initialRules 
      : [{ minOrderPrice: "", maxDistance: "", charge: "" }]
  );
  const [isLoading, setIsLoading] = useState(false);

  const addRule = () => {
    setRules([...rules, { minOrderPrice: "", maxDistance: "", charge: "" }]);
  };

  const removeRule = (index) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    if (newRules.length === 0) {
      newRules.push({ minOrderPrice: "", maxDistance: "", charge: "" });
    }
    setRules(newRules);
  };

  const handleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clean up empty fields
    const cleanedRules = rules.map(r => ({
      minOrderPrice: r.minOrderPrice === "" ? null : Number(r.minOrderPrice),
      maxDistance: r.maxDistance === "" ? null : Number(r.maxDistance),
      charge: r.charge === "" ? 0 : Number(r.charge),
    }));

    const formData = new FormData();
    formData.append("rules", JSON.stringify(cleanedRules));
    
    const res = await updateDeliveryRulesAction(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Delivery rules saved successfully!");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Delivery</h1>
        <p className="text-sm text-gray-500 mt-1">Configure delivery charges based on distance and order price.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">How delivery rules work:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Max Distance (km):</strong> Applies to customers within this distance from the shop.</li>
            <li><strong>Min Order Price (₹):</strong> Applies if the cart total is greater than or equal to this amount.</li>
            <li><strong>Delivery Charge (₹):</strong> The fee added to the order.</li>
          </ul>
          <p className="mt-2 text-xs italic">Note: Live Google Maps detection will be enabled in a future update. For now, a fixed flat fee of ₹60 is applied on the storefront.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 pb-2 border-b">
            <div className="text-sm font-semibold text-gray-700">Max Distance (km)</div>
            <div className="text-sm font-semibold text-gray-700">Min Order Price (₹)</div>
            <div className="text-sm font-semibold text-gray-700">Delivery Charge (₹)</div>
            <div className="w-8"></div>
          </div>
          
          {rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center">
              <div>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 5" 
                  value={rule.maxDistance} 
                  onChange={(e) => handleChange(index, "maxDistance", e.target.value)} 
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="e.g. 500" 
                  value={rule.minOrderPrice} 
                  onChange={(e) => handleChange(index, "minOrderPrice", e.target.value)} 
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="e.g. 30" 
                  value={rule.charge} 
                  onChange={(e) => handleChange(index, "charge", e.target.value)} 
                  required
                />
              </div>
              <div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeRule(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 pb-4">
          <Button type="button" variant="outline" onClick={addRule} className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8">
            {isLoading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
