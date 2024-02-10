-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "deactivated" BOOLEAN,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expenseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,
    "handlerId" INTEGER NOT NULL,
    "customerSalutation" TEXT NOT NULL,
    "customerInitials" TEXT NOT NULL,
    "customerPrefix" TEXT,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "secondCustomerSalutation" TEXT,
    "secondCustomerInitials" TEXT,
    "secondCustomerPrefix" TEXT,
    "secondCustomerLastName" TEXT,
    "secondCustomerEmail" TEXT,
    "invoiceAddress" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "passingDate" TIMESTAMP(3),
    "notaryName" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "starterLoan" BOOLEAN NOT NULL DEFAULT false,
    "objectAddress" TEXT NOT NULL,
    "objectPostalCode" TEXT NOT NULL,
    "objectCity" TEXT NOT NULL,
    "mortgageInvoiceAmount" DECIMAL(65,30),
    "insuranceInvoiceAmount" DECIMAL(65,30),
    "otherInvoiceAmount" DECIMAL(65,30),
    "signedOTDV" TEXT NOT NULL,
    "zzpInvoice" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "spreadPaymentAgreement" TEXT,
    "notes" TEXT,
    "IBDeclaration" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
