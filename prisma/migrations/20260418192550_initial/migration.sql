-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "appointmentNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedTechnicianId" INTEGER,
    "assignedTechnicianName" TEXT,
    "serviceAdvisorId" INTEGER,
    "serviceAdvisorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "bayNumber" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdDate" TEXT NOT NULL,
    "confirmedDate" TEXT,
    "jobCardId" INTEGER,
    "quotationId" INTEGER,
    "walkAroundInspectionId" INTEGER,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.14,
    "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "approvedDate" TEXT,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "quotationId" INTEGER,
    "quotationNumber" TEXT,
    "customerId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "estimatedCompletionDate" TEXT NOT NULL,
    "actualCompletionDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTechnicianId" INTEGER,
    "assignedTechnicianName" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "partNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "maximumStock" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-stock',
    "lastRestocked" TEXT NOT NULL,
    "lastSold" TEXT NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPurchases" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "partId" INTEGER NOT NULL,
    "partNumber" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "ownerId" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "firstRegistered" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInspection" (
    "id" SERIAL NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "appointmentId" INTEGER,
    "customerId" INTEGER,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleYear" INTEGER,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "fuelLevel" TEXT NOT NULL DEFAULT '1/2',
    "damageMarkers" JSONB NOT NULL DEFAULT '[]',
    "generalNotes" TEXT NOT NULL DEFAULT '',
    "technicianName" TEXT NOT NULL,
    "serviceAdvisorName" TEXT,
    "serviceAdvisorSignature" TEXT,
    "customerSignature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdDate" TEXT NOT NULL,

    CONSTRAINT "VehicleInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInService" (
    "id" SERIAL NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "bayNumber" INTEGER,
    "serviceType" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'waiting-for-walkaround',
    "entryDate" TEXT NOT NULL,
    "entryTime" TEXT NOT NULL,
    "estimatedCompletion" TEXT NOT NULL,
    "notes" TEXT,
    "pendingJobItems" JSONB NOT NULL DEFAULT '[]',
    "bookedDate" TEXT,
    "appointmentId" INTEGER,
    "inspectionId" INTEGER,

    CONSTRAINT "VehicleInService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenancePack" (
    "id" SERIAL NOT NULL,
    "packNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "labourTasks" JSONB NOT NULL DEFAULT '[]',
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" TEXT NOT NULL,
    "applicableMakes" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "MaintenancePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMCustomer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "address" TEXT,
    "city" TEXT,
    "idNumber" TEXT,
    "company" TEXT,
    "vatNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "customerSince" TEXT NOT NULL,
    "lastContact" TEXT,
    "nextFollowUp" TEXT,
    "preferredContact" TEXT NOT NULL DEFAULT 'phone',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "notes" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "CRMCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartsQuote" (
    "id" SERIAL NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.14,
    "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TEXT,

    CONSTRAINT "PartsQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentNumber_key" ON "Appointment"("appointmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Part_partNumber_key" ON "Part"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInspection_inspectionNumber_key" ON "VehicleInspection"("inspectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInService_jobNumber_key" ON "VehicleInService"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenancePack_packNumber_key" ON "MaintenancePack"("packNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CRMCustomer_email_key" ON "CRMCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PartsQuote_quoteNumber_key" ON "PartsQuote"("quoteNumber");
