import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data
    await prisma.appointment.deleteMany();
    await prisma.cRMCustomer.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.part.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.maintenancePack.deleteMany();
    await prisma.vehicleInspection.deleteMany();
    await prisma.job.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.vehicleInService.deleteMany();
    await prisma.partsQuote.deleteMany();

    console.log('✅ Cleared existing data');

    // Create CRM customers
    const customers = await prisma.cRMCustomer.createMany({
      data: [
        {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@email.ao',
          phone: '+244 923 456 789',
          whatsapp: '+244 923 456 789',
          address: 'Rua da República 123',
          city: 'Luanda',
          idNumber: '00123456LA001',
          company: 'Silva Transport',
          vatNumber: 'AO123456789',
          status: 'active',
          customerSince: '2024-01-15',
          lastContact: '2024-11-20',
          nextFollowUp: '2024-12-15',
          preferredContact: 'phone',
          tags: JSON.stringify(['regular', 'fleet']),
          notes: JSON.stringify(['Prefers morning appointments', 'Multiple vehicles']),
        },
        {
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.santos@email.ao',
          phone: '+244 912 345 678',
          address: 'Avenida Brasil 456',
          city: 'Luanda',
          idNumber: '00789012LA002',
          status: 'active',
          customerSince: '2024-02-10',
          lastContact: '2024-11-18',
          preferredContact: 'whatsapp',
          tags: JSON.stringify(['individual']),
          notes: JSON.stringify([]),
        },
      ],
    });

    console.log('✅ Created customers');

    // Create vehicles
    const vehicles = await prisma.vehicle.createMany({
      data: [
        {
          plate: 'LD-12-34-AB',
          vin: 'JTMRN3DV5C0084234',
          make: 'Toyota',
          model: 'Hilux',
          year: 2020,
          color: 'Silver',
          engineType: 'Diesel',
          transmission: 'Manual',
          currentMileage: 125000,
          ownerId: 1,
          ownerName: 'João Silva',
          ownerPhone: '+244 923 456 789',
          ownerEmail: 'joao.silva@email.ao',
          firstRegistered: '2020-03-15',
          notes: 'Work truck for transport business',
        },
        {
          plate: 'LA-98-76-CD',
          vin: 'JT2BV18K8M0089123',
          make: 'Toyota',
          model: 'Corolla',
          year: 2018,
          color: 'Black',
          engineType: 'Petrol',
          transmission: 'Automatic',
          currentMileage: 92000,
          ownerId: 2,
          ownerName: 'Maria Santos',
          ownerPhone: '+244 912 345 678',
          ownerEmail: 'maria.santos@email.ao',
          firstRegistered: '2018-06-10',
          notes: '',
        },
      ],
    });

    console.log('✅ Created vehicles');

    // Create suppliers
    const suppliers = await prisma.supplier.createMany({
      data: [
        {
          name: 'AutoParts Angola',
          contactPerson: 'Carlos Mendes',
          phone: '+244 924 567 890',
          email: 'contact@autoparts.ao',
          address: 'Bairro da Maianga, Luanda',
          rating: 4.8,
          totalPurchases: 450000,
        },
        {
          name: 'Toyota Official Distributor',
          contactPerson: 'Fernando Pereira',
          phone: '+244 922 111 222',
          email: 'distributor@toyota.ao',
          address: 'Industrial Zone, Luanda',
          rating: 5,
          totalPurchases: 1200000,
        },
        {
          name: 'Engine Parts SA',
          contactPerson: 'Ricardo Oliveira',
          phone: '+244 925 333 444',
          email: 'sales@engineparts.ao',
          address: 'Rua da Indústria 789',
          rating: 4.5,
          totalPurchases: 320000,
        },
      ],
    });

    console.log('✅ Created suppliers');

    // Create parts
    const parts = await prisma.part.createMany({
      data: [
        {
          partNumber: 'OF-123',
          name: 'Oil Filter',
          description: 'Genuine Toyota oil filter',
          category: 'Filters',
          manufacturer: 'Toyota',
          supplierId: 1,
          supplierName: 'Toyota Official Distributor',
          currentStock: 45,
          minimumStock: 10,
          maximumStock: 100,
          reorderPoint: 20,
          unit: 'pcs',
          costPrice: 4000,
          sellPrice: 5000,
          location: 'Shelf A1',
          status: 'in-stock',
          lastRestocked: '2024-11-15',
          lastSold: '2024-11-20',
        },
        {
          partNumber: 'AF-456',
          name: 'Air Filter',
          description: 'Engine air filter',
          category: 'Filters',
          manufacturer: 'Toyota',
          supplierId: 2,
          supplierName: 'Toyota Official Distributor',
          currentStock: 32,
          minimumStock: 10,
          maximumStock: 80,
          reorderPoint: 15,
          unit: 'pcs',
          costPrice: 3200,
          sellPrice: 4000,
          location: 'Shelf A2',
          status: 'in-stock',
          lastRestocked: '2024-11-10',
          lastSold: '2024-11-18',
        },
        {
          partNumber: 'BP-789',
          name: 'Brake Pads (Front)',
          description: 'Front brake pad set',
          category: 'Braking System',
          manufacturer: 'Bosch',
          supplierId: 1,
          supplierName: 'AutoParts Angola',
          currentStock: 18,
          minimumStock: 5,
          maximumStock: 50,
          reorderPoint: 10,
          unit: 'sets',
          costPrice: 10000,
          sellPrice: 12000,
          location: 'Shelf B3',
          status: 'in-stock',
          lastRestocked: '2024-11-12',
          lastSold: '2024-11-20',
        },
        {
          partNumber: 'OC-101',
          name: 'Engine Oil (5L)',
          description: '5L synthetic engine oil',
          category: 'Fluids',
          manufacturer: 'Mobil',
          supplierId: 1,
          supplierName: 'AutoParts Angola',
          currentStock: 24,
          minimumStock: 10,
          maximumStock: 60,
          reorderPoint: 20,
          unit: 'bottles',
          costPrice: 12000,
          sellPrice: 15000,
          location: 'Shelf C1',
          status: 'in-stock',
          lastRestocked: '2024-11-18',
          lastSold: '2024-11-20',
        },
      ],
    });

    console.log('✅ Created parts');

    // Create stock movements
    await prisma.stockMovement.createMany({
      data: [
        {
          partId: 1,
          partNumber: 'OF-123',
          partName: 'Oil Filter',
          type: 'sale',
          quantity: 2,
          date: '2024-11-20',
          reference: 'JOB-202411-0001',
          notes: 'Sold for oil change service',
        },
        {
          partId: 2,
          partNumber: 'AF-456',
          partName: 'Air Filter',
          type: 'sale',
          quantity: 1,
          date: '2024-11-20',
          reference: 'JOB-202411-0001',
          notes: 'Sold for oil change service',
        },
        {
          partId: 3,
          partNumber: 'BP-789',
          partName: 'Brake Pads (Front)',
          type: 'sale',
          quantity: 2,
          date: '2024-11-26',
          reference: 'JOB-202411-0001',
          notes: 'Sold for brake pad replacement',
        },
      ],
    });

    console.log('✅ Created stock movements');

    // Create quotations
    const quotations = await prisma.quotation.createMany({
      data: [
        {
          quotationNumber: 'QT-202411-0001',
          date: '2024-11-20',
          validUntil: '2024-12-20',
          customerId: 1,
          customerName: 'João Silva',
          customerPhone: '+244 923 456 789',
          customerEmail: 'joao.silva@email.ao',
          vehicleMake: 'Toyota',
          vehicleModel: 'Hilux',
          vehiclePlate: 'LD-12-34-AB',
          items: JSON.stringify([
            { id: 1, description: 'Engine Oil Change', quantity: 1, unitPrice: 15000, isLabor: true, estimatedHours: 1, total: 15000 },
            { id: 2, description: 'Oil Filter', partNumber: 'OF-123', quantity: 1, unitPrice: 5000, isLabor: false, total: 5000 },
            { id: 3, description: 'Air Filter', partNumber: 'AF-456', quantity: 1, unitPrice: 4000, isLabor: false, total: 4000 },
            { id: 4, description: 'Brake Inspection', quantity: 1, unitPrice: 8000, isLabor: true, estimatedHours: 0.5, total: 8000 },
          ]),
          subtotal: 32000,
          vatRate: 0.14,
          vatAmount: 4480,
          total: 36480,
          notes: 'Includes full inspection of brake system.',
          status: 'sent',
          createdBy: 'Admin',
        },
      ],
    });

    console.log('✅ Created quotations');

    // Create jobs
    const jobs = await prisma.job.createMany({
      data: [
        {
          jobNumber: 'JOB-202411-0001',
          quotationId: 1,
          quotationNumber: 'QT-202411-0001',
          customerId: 1,
          customerName: 'João Silva',
          vehicleMake: 'Toyota',
          vehicleModel: 'Hilux',
          vehiclePlate: 'LD-12-34-AB',
          startDate: '2024-11-25',
          estimatedCompletionDate: '2024-11-26',
          actualCompletionDate: '2024-11-26',
          status: 'completed',
          assignedTechnicianId: 1,
          assignedTechnicianName: 'Mike Rodriguez',
          items: JSON.stringify([
            { id: 1, description: 'Engine Oil Change', quantity: 1, unitPrice: 15000, isLabor: true, estimatedHours: 1, total: 15000 },
            { id: 2, description: 'Oil Filter', partNumber: 'OF-123', quantity: 1, unitPrice: 5000, isLabor: false, total: 5000 },
            { id: 3, description: 'Air Filter', partNumber: 'AF-456', quantity: 1, unitPrice: 4000, isLabor: false, total: 4000 },
            { id: 4, description: 'Brake Inspection', quantity: 1, unitPrice: 8000, isLabor: true, estimatedHours: 0.5, total: 8000 },
            { id: 5, description: 'Brake Pads Replacement', quantity: 1, unitPrice: 25000, isLabor: true, estimatedHours: 2, total: 25000 },
            { id: 6, description: 'Brake Pads (Front)', partNumber: 'BP-789', quantity: 2, unitPrice: 12000, isLabor: false, total: 24000 },
          ]),
          subtotal: 81000,
          vatAmount: 11340,
          total: 92340,
          notes: 'Additional brake pad replacement required due to wear.',
        },
      ],
    });

    console.log('✅ Created jobs');

    // Create maintenance packs
    await prisma.maintenancePack.createMany({
      data: [
        {
          packNumber: 'MP-001',
          name: 'Basic Oil Change',
          description: 'Engine oil and filter change',
          category: 'Maintenance',
          labourTasks: JSON.stringify([
            { task: 'Drain old oil', hours: 0.5 },
            { task: 'Replace oil filter', hours: 0.3 },
            { task: 'Fill new oil', hours: 0.2 },
          ]),
          totalHours: 1,
          totalAmount: 15000,
          isActive: true,
          createdDate: '2024-01-10',
          applicableMakes: JSON.stringify(['Toyota', 'Hyundai', 'Honda']),
        },
        {
          packNumber: 'MP-002',
          name: 'Brake Service',
          description: 'Complete brake system inspection and service',
          category: 'Braking System',
          labourTasks: JSON.stringify([
            { task: 'Inspect brake pads', hours: 0.5 },
            { task: 'Replace brake pads', hours: 1.5 },
            { task: 'Bleed brake fluid', hours: 1 },
          ]),
          totalHours: 3,
          totalAmount: 35000,
          isActive: true,
          createdDate: '2024-01-15',
          applicableMakes: JSON.stringify(['Toyota', 'Honda', 'Nissan']),
        },
        {
          packNumber: 'MP-003',
          name: 'Full Service',
          description: 'Complete vehicle maintenance',
          category: 'Maintenance',
          labourTasks: JSON.stringify([
            { task: 'Oil and filter change', hours: 1 },
            { task: 'Brake inspection', hours: 1 },
            { task: 'Air filter replacement', hours: 0.5 },
            { task: 'Fluid top-up', hours: 0.5 },
          ]),
          totalHours: 3,
          totalAmount: 50000,
          isActive: true,
          createdDate: '2024-02-01',
          applicableMakes: JSON.stringify(['Toyota', 'Honda', 'Hyundai', 'Nissan']),
        },
      ],
    });

    console.log('✅ Created maintenance packs');

    // Create appointments
    await prisma.appointment.createMany({
      data: [
        {
          appointmentNumber: 'APT-202411-0001',
          date: '2024-11-25',
          time: '09:00',
          duration: 2,
          customerId: 1,
          customerName: 'João Silva',
          customerPhone: '+244 923 456 789',
          customerEmail: 'joao.silva@email.ao',
          vehicleMake: 'Toyota',
          vehicleModel: 'Hilux',
          vehiclePlate: 'LD-12-34-AB',
          serviceType: 'Maintenance',
          description: 'Oil change and brake inspection',
          assignedTechnicianId: 1,
          assignedTechnicianName: 'Mike Rodriguez',
          serviceAdvisorId: 1,
          serviceAdvisorName: 'Admin',
          status: 'completed',
          bayNumber: 1,
          estimatedCost: 36480,
          notes: 'Customer prefers morning appointments',
          createdDate: '2024-11-20',
          confirmedDate: '2024-11-20',
          jobCardId: 1,
        },
        {
          appointmentNumber: 'APT-202411-0002',
          date: '2024-11-27',
          time: '14:00',
          duration: 1.5,
          customerId: 2,
          customerName: 'Maria Santos',
          customerPhone: '+244 912 345 678',
          customerEmail: 'maria.santos@email.ao',
          vehicleMake: 'Toyota',
          vehicleModel: 'Corolla',
          vehiclePlate: 'LA-98-76-CD',
          serviceType: 'Inspection',
          description: 'General vehicle inspection',
          status: 'scheduled',
          createdDate: '2024-11-22',
        },
      ],
    });

    console.log('✅ Created appointments');

    // Create inspections
    await prisma.vehicleInspection.createMany({
      data: [
        {
          inspectionNumber: 'INS-202411-0001',
          date: '2024-11-25',
          time: '09:15',
          customerId: 1,
          customerName: 'João Silva',
          customerPhone: '+244 923 456 789',
          vehiclePlate: 'LD-12-34-AB',
          vehicleMake: 'Toyota',
          vehicleModel: 'Hilux',
          vehicleYear: 2020,
          mileage: 125000,
          fuelLevel: '3/4',
          damageMarkers: JSON.stringify([
            { location: 'front-bumper', severity: 'minor', description: 'Small scratch' },
          ]),
          generalNotes: 'Vehicle in good condition overall',
          technicianName: 'Mike Rodriguez',
          serviceAdvisorName: 'Admin',
          status: 'completed',
          createdDate: '2024-11-25',
        },
      ],
    });

    console.log('✅ Created inspections');

    // Create vehicles in service
    await prisma.vehicleInService.createMany({
      data: [
        {
          jobNumber: 'JOB-202411-0001',
          plate: 'LD-12-34-AB',
          make: 'Toyota',
          model: 'Hilux',
          year: 2020,
          ownerName: 'João Silva',
          ownerPhone: '+244 923 456 789',
          technicianName: 'Mike Rodriguez',
          bayNumber: 1,
          serviceType: 'Maintenance',
          stage: 'completed',
          entryDate: '2024-11-25',
          entryTime: '09:00',
          estimatedCompletion: '2024-11-26',
          notes: 'Oil change and brake pads replacement completed',
          pendingJobItems: JSON.stringify([]),
          appointmentId: 1,
        },
      ],
    });

    console.log('✅ Created vehicles in service');

    // Create parts quotes
    await prisma.partsQuote.createMany({
      data: [
        {
          quoteNumber: 'PQ-202411-0001',
          date: '2024-11-20',
          validUntil: '2024-12-20',
          customerName: 'Auto Repair Shop',
          customerPhone: '+244 923 999 888',
          items: JSON.stringify([
            { partNumber: 'OF-123', name: 'Oil Filter', quantity: 10, unitPrice: 5000, total: 50000 },
            { partNumber: 'AF-456', name: 'Air Filter', quantity: 5, unitPrice: 4000, total: 20000 },
          ]),
          subtotal: 70000,
          vatRate: 0.14,
          vatAmount: 9800,
          total: 79800,
          status: 'open',
          notes: 'Bulk order discount applied',
        },
      ],
    });

    console.log('✅ Created parts quotes');
    console.log('✅ Database seeded successfully!');
  } catch (e) {
    console.error('❌ Seed error:', e);
    throw e;
  }
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
