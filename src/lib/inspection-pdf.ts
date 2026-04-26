import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type VehicleInspection, type DamageMarker } from '@/lib/vehicle-inspection';

const fmt = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' AOA';

export const exportInspectionPDF = (inspection: VehicleInspection) => {
  const doc = new jsPDF();

  // ── Header ────────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE INSPECTION REPORT', 105, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inspection.date}  ${inspection.time}  |  Ref: ${inspection.inspectionNumber}`, 105, 22, { align: 'center' });

  // ── Vehicle info block ────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE', 14, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const vehicleLines = [
    `Make / Model: ${inspection.vehicleMake} ${inspection.vehicleModel}`,
    `Plate: ${inspection.vehiclePlate}  |  Year: ${inspection.vehicleYear ?? '—'}`,
    `Mileage: ${inspection.mileage.toLocaleString()} km  |  Fuel: ${inspection.fuelLevel}`,
  ];
  vehicleLines.forEach((l, i) => doc.text(l, 14, 48 + i * 6));

  // ── Customer & Advisor ────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER', 110, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${inspection.customerName}`, 110, 48);
  if (inspection.customerPhone) doc.text(`Phone: ${inspection.customerPhone}`, 110, 54);
  doc.text(`Service Advisor: ${inspection.serviceAdvisorName ?? '—'}`, 110, 60);
  doc.text(`Technician: ${inspection.technicianName}`, 110, 66);

  // ── Damage markers table ──────────────────────────────────────
  const markers: DamageMarker[] = Array.isArray(inspection.damageMarkers)
    ? inspection.damageMarkers
    : JSON.parse((inspection.damageMarkers as any) ?? '[]');

  autoTable(doc, {
    startY: 80,
    head: [['Zone', 'Type', 'Severity', 'Details']],
    body: markers.length
      ? markers.map(m => [m.zoneName, m.type, m.severity, m.notes || '—'])
      : [['No damage recorded', '—', '—', '—']],
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 3: { cellWidth: 80 } },
  });

  const afterTable = (doc as any).lastAutoTable.finalY + 10;

  // ── General notes ─────────────────────────────────────────────
  if (inspection.generalNotes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('General Notes:', 14, afterTable);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(inspection.generalNotes, 180);
    doc.text(wrapped, 14, afterTable + 6);
  }

  const sigY = afterTable + (inspection.generalNotes ? 30 : 10);

  // ── Signatures ────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures', 14, sigY);

  // Service Advisor signature
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Service Advisor', 14, sigY + 8);
  if (inspection.serviceAdvisorSignature) {
    try {
      doc.addImage(inspection.serviceAdvisorSignature, 'PNG', 14, sigY + 10, 70, 25);
    } catch (e) {
      doc.line(14, sigY + 30, 84, sigY + 30);
    }
  } else {
    doc.line(14, sigY + 30, 84, sigY + 30);
  }

  // Customer signature
  doc.text('Customer', 110, sigY + 8);
  if (inspection.customerSignature) {
    try {
      doc.addImage(inspection.customerSignature, 'PNG', 110, sigY + 10, 70, 25);
    } catch (e) {
      doc.line(110, sigY + 30, 180, sigY + 30);
    }
  } else {
    doc.line(110, sigY + 30, 180, sigY + 30);
  }

  doc.save(`inspection-${inspection.inspectionNumber}.pdf`);
};
