-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expenseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "State_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
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
    "passingDate" DATETIME,
    "notaryName" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "starterLoan" BOOLEAN NOT NULL DEFAULT false,
    "objectAddress" TEXT NOT NULL,
    "objectPostalCode" TEXT NOT NULL,
    "objectCity" TEXT NOT NULL,
    "mortgageInvoiceAmount" DECIMAL,
    "insuranceInvoiceAmount" DECIMAL,
    "otherInvoiceAmount" DECIMAL,
    "signedOTDV" TEXT NOT NULL,
    "zzpInvoice" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "spreadPaymentAgreement" TEXT,
    "notes" TEXT,
    "IBDeclaration" TEXT NOT NULL,
    CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
