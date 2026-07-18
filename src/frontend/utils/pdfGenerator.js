import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { robotoBase64 } from "./robotoFont";

export function downloadThermalReceipt(order, profile) {
  // Sanitize text to remove non-ASCII characters that break jsPDF's default Helvetica font, but keep ₹
  const sanitizeText = (text) => {
    if (!text) return "Item";
    // Allow standard text and the Rupee symbol
    const cleaned = text.replace(/[^\x20-\x7E₹]/g, "").trim();
    return cleaned.replace(/\s+/g, ' ') || "Item";
  };

  const tableData = order.order_items?.map(item => [
    sanitizeText(item.products?.name), 
    item.quantity.toString(),
    (item.quantity * item.price_at_time).toString()
  ]) || [];

  // Calculate exact height using a dummy doc to prevent bottom paper waste
  const dummyDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: [58, 1000] });
  dummyDoc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
  dummyDoc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  
  autoTable(dummyDoc, {
    startY: 15,
    margin: { left: 2, right: 2, bottom: 2 },
    head: [[
      { content: 'Item', styles: { halign: 'left' } },
      { content: 'Q', styles: { halign: 'right' } },
      { content: 'Amt', styles: { halign: 'right' } }
    ]],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: { top: 0.2, bottom: 0.2, left: 1, right: 1 }, font: "Roboto" },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 8, halign: 'right' }, 2: { cellWidth: 14, halign: 'right' } }
  });
  
  const estimatedFinalY = dummyDoc.lastAutoTable.finalY || 25;
  const deliveryCharge = order.delivery_type === 'home_delivery' ? 40 : 0;
  const extraHeight = deliveryCharge > 0 ? 22 : 12; // 22/12mm for text + 15mm extra blank padding for Edge browser compatibility
  const exactHeight = Math.max(estimatedFinalY + extraHeight, 65); // Enforce min height so jsPDF doesn't swap width/height

  // Real document with exact height
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [58, exactHeight]
  });
  
  doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

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
  centerText("SHIVAM GENERAL STORE", 6, 11, true);

  // Order Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const orderId = `#${order.id.split('-')[0].toUpperCase()}`;
  
  const dateObj = new Date(order.created_at);
  const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear().toString().slice(-2)}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  
  doc.text(orderId, 3, 12);
  doc.text(dateStr, 55, 12, { align: "right" });

  const pName = profile?.full_name || order.profiles?.full_name || "CUSTOMER";
  const customerName = pName.toUpperCase().substring(0, 18);
  const customerPhone = profile?.phone || order.profiles?.phone || "";
  
  doc.setFont("helvetica", "bold");
  doc.text(customerName, 3, 17);
  if (customerPhone) {
    doc.text(customerPhone, 55, 17, { align: "right" });
  }

  // Table
  autoTable(doc, {
    startY: 20, // Closed the gap after customer name (was 28 originally)
    margin: { left: 2, right: 2, bottom: 2 },
    head: [[
      { content: 'Item', styles: { halign: 'left' } },
      { content: 'Q', styles: { halign: 'right' } },
      { content: 'Amt', styles: { halign: 'right' } }
    ]],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: { top: 0.2, bottom: 0.2, left: 1, right: 1 }, 
      font: "Roboto",
      textColor: 20
    },
    headStyles: {
      font: "helvetica",
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

  // Total Breakdown
  const subTotal = Number(order.total_amount);
  const grandTotal = subTotal + deliveryCharge;
  
  let currentY = finalY + 5;
  doc.setFontSize(11);

  if (deliveryCharge > 0) {
    doc.setFont("helvetica", "normal");
    doc.text("Items Total:", 3, currentY);
    doc.text(`${subTotal.toFixed(2)}`, 55, currentY, { align: "right" });
    currentY += 4;
    doc.text("Delivery:", 3, currentY);
    doc.text(`${deliveryCharge.toFixed(2)}`, 55, currentY, { align: "right" });
    currentY += 5; // small gap before grand total
  }

  doc.setFont("helvetica", "bold"); 
  doc.text("Total:", 3, currentY); 
  doc.text(`${grandTotal.toFixed(2)}`, 55, currentY, { align: "right" });

  doc.save(`bill_${orderId.replace('#', '')}.pdf`);
}
