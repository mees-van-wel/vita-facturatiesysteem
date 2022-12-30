import { Badge } from "@mantine/core";
import { State } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Table, { SortOption, TableHeaders } from "../../components/Table/Table";
import {
  ExpenseState,
  expenseStateColor,
  expenseStateLabel,
} from "../../enums/expenseState.enum";
import { FilterType } from "../../enums/filterType.enum";
import { Role } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";
import {
  IBDeclaration,
  IBDeclarationLabel,
  PaymentMethod,
  PaymentMethodLabel,
} from "../Expense/Expense";

const initialTableHeaders: TableHeaders = [
  {
    key: "id",
    label: "ID",
    filterType: FilterType.Number,
  },
  {
    key: "states",
    label: "Status",
    format: (states: State[]) => (
      <Badge
        color={
          expenseStateColor[states[states.length - 1].type as ExpenseState]
        }
      >
        {expenseStateLabel[states[states.length - 1].type as ExpenseState]}
      </Badge>
    ),
  },
  {
    show: false,
    key: "states",
    label: "Opnieuw ingediend",
    format: (states: State[]) =>
      states.reduce((count, current) => {
        if (current.type === ExpenseState.Resubmitted) count = count + 1;
        return count;
      }, 0),
  },
  {
    key: "isEarly",
    label: "Te laat",
    format: (isEarly: boolean) => <Badge>{isEarly ? "Ja" : "Nee"}</Badge>,
  },
  {
    key: "createdAt",
    label: "Ingediend",
    format: (date) => new Date(date).toLocaleString("nl-NL"),
    filterType: FilterType.Date,
    sort: SortOption.Ascending,
  },
  {
    key: "completedAt",
    label: "Gefactureerd",
    format: (date) =>
      date ? new Date(date).toLocaleString("nl-NL") : "Nog niet",
    filterType: FilterType.Date,
  },
  {
    key: "customerName",
    label: "Naam klant",
    filterType: FilterType.String,
  },
  {
    key: "customerEmail",
    label: "E-mail klant",
    filterType: FilterType.String,
  },
  {
    show: false,
    key: "invoiceAddress",
    label: "Factuuradres",
  },
  {
    show: false,
    key: "postalCode",
    label: "Postcode",
  },
  {
    show: false,
    key: "city",
    label: "Stad",
  },
  {
    key: "passingDate",
    label: "Passeerdatum",
    format: (date) => new Date(date).toLocaleDateString("nl-NL"),
    filterType: FilterType.Date,
  },
  {
    show: false,
    key: "notaryName",
    label: "Notarisnaam",
  },
  {
    key: "company.name",
    label: "Maatschappij",
    filterType: FilterType.String,
  },
  {
    key: "objectAddress",
    label: "Adres object",
    filterType: FilterType.String,
  },
  {
    key: "objectCity",
    label: "Plaats object",
    filterType: FilterType.String,
  },
  {
    key: "mortgageInvoiceAmount",
    label: "Bedrag hypotheek",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
    filterType: FilterType.Decimal,
  },
  {
    key: "insuranceInvoiceAmount",
    label: "Bedrag verzekering",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
    filterType: FilterType.Decimal,
  },
  {
    key: "otherInvoiceAmount",
    label: "Bedrag overige",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
    filterType: FilterType.Decimal,
  },
  {
    show: false,
    key: "notes",
    label: "Opmerkingen",
  },
  {
    show: false,
    key: "paymentMethod",
    label: "Betaalwijze",
    format: (paymentMethod: PaymentMethod) => PaymentMethodLabel[paymentMethod],
  },
  {
    show: false,
    key: "IBDeclaration",
    label: "IB-aangifte door partner",
    format: (iBDeclaration: IBDeclaration) => IBDeclarationLabel[iBDeclaration],
  },
];

export const Expenses: NextPageWithLayout = () => {
  const [tableHeaders, setTableHeaders] =
    useState<TableHeaders>(initialTableHeaders);

  const session = useSession();

  useEffect(() => {
    if (session.data?.user.role === Role.FinancialWorker)
      setTableHeaders([
        ...tableHeaders,
        {
          key: "handler.name",
          label: "Behandelaar",
          filterType: FilterType.String,
        },
      ]);
  }, []);

  return (
    <div>
      <Table
        title="Verzoeken"
        route={Route.Expenses}
        dataRoute={Route.ApiExpenses}
        headers={tableHeaders}
        canCreate={
          session.data?.user.role !== Role.FinancialWorker &&
          session.data?.user.role !== Role.Administrator
        }
      />
    </div>
  );
};

Expenses.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
