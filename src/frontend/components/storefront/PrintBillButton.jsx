"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadThermalReceipt } from "@/frontend/utils/pdfGenerator";

export default function PrintBillButton({ order, profile }) {
  return (
    <Button 
      onClick={() => downloadThermalReceipt(order, profile)}
      className="bg-green-700 hover:bg-green-800 text-white font-bold"
    >
      <Printer className="h-4 w-4 mr-2" /> Download / Print Bill
    </Button>
  );
}
