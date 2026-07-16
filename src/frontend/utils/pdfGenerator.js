import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadThermalReceipt(order, profile) {
  const tableData = order.order_items?.map(item => [
    item.products?.name || "Item", 
    item.quantity.toString(),
    item.price_at_time.toString()
  ]) || [];

  // Calculate exact height using a dummy doc to prevent bottom paper waste
  const dummyDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [58, 1000] });
  autoTable(dummyDoc, {
    startY: 25,
    margin: { left: 2, right: 2 },
    head: [[
      { content: 'Item', styles: { halign: 'left' } },
      { content: 'Q', styles: { halign: 'right' } },
      { content: 'Amt', styles: { halign: 'right' } }
    ]],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 1, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 8, halign: 'right' }, 2: { cellWidth: 14, halign: 'right' } }
  });
  
  const estimatedFinalY = dummyDoc.lastAutoTable.finalY || 25;
  const exactHeight = Math.max(estimatedFinalY + 10, 65); // Enforce min height so jsPDF doesn't swap width/height

  // Real document with exact height
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [58, exactHeight]
  });

  // Font setup
  doc.setFont("helvetica");

  const centerText = (text, y, size = 10, isBold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    const x = (58 - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Header
  centerText("SHIVAM GENERAL STORE", 10, 11, true);

  // Order Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const orderId = `#${order.id.split('-')[0].toUpperCase()}`;
  
  const dateObj = new Date(order.created_at);
  const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear().toString().slice(-2)}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  
  doc.text(orderId, 3, 17);
  doc.text(dateStr, 55, 17, { align: "right" });

  const pName = profile?.full_name || order.profiles?.full_name || "CUSTOMER";
  const customerName = pName.toUpperCase().substring(0, 18);
  const customerPhone = profile?.phone || order.profiles?.phone || "";
  
  doc.setFont("helvetica", "bold");
  doc.text(customerName, 3, 22);
  if (customerPhone) {
    doc.text(customerPhone, 55, 22, { align: "right" });
  }

  // Table
  autoTable(doc, {
    startY: 25, // Closed the gap after customer name (was 28 originally)
    margin: { left: 2, right: 2 },
    head: [[
      { content: 'Item', styles: { halign: 'left' } },
      { content: 'Q', styles: { halign: 'right' } },
      { content: 'Amt', styles: { halign: 'right' } }
    ]],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 1, 
      font: "helvetica",
      textColor: 20
    },
    headStyles: {
      fontStyle: 'bold',
      textColor: 0
    },
    columnStyles: {
      0: { cellWidth: 32 }, 
      1: { cellWidth: 8, halign: 'right' }, 
      2: { cellWidth: 14, halign: 'right' } 
    }
  });

  const finalY = doc.lastAutoTable.finalY || 25;

  // Total
  const grandTotal = Number(order.total_amount) + (order.delivery_type === 'home_delivery' ? 40 : 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold"); // Bolded Total as per screenshot
  doc.text("Total:", 3, finalY + 5); // Closed the gap after table (was finalY + 9 originally)
  doc.text(`${grandTotal.toFixed(2)}`, 55, finalY + 5, { align: "right" });

  doc.save(`bill_${orderId.replace('#', '')}.pdf`);
}
