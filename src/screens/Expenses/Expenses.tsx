import { Badge } from "@mantine/core";
import { State } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ReactElement, useEffect } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Table, { TableHeaders } from "../../components/Table/Table";
import {
  expenseStateColor,
  expenseStateLabel,
} from "../../enums/expenseState.enum";
import { FilterType } from "../../enums/filterType.enum";
import { Role } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";

const tableHeaders: TableHeaders = [
  {
    key: "id",
    label: "ID",
    filterType: FilterType.Number,
  },
  {
    key: "states",
    label: "Status",
    format: (states: State[]) => (
      <Badge color={expenseStateColor[states[states.length - 1].type]}>
        {expenseStateLabel[states[states.length - 1].type]}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Ingediend",
    format: (date) => new Date(date).toLocaleString("nl-NL"),
    filterType: FilterType.Date,
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
    key: "passingDate",
    label: "Passeerdatum",
    format: (date) => new Date(date).toLocaleDateString("nl-NL"),
    filterType: FilterType.Date,
  },
  {
    key: "company.name",
    label: "Maatschappij",
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
];

export const Expenses: NextPageWithLayout = () => {
  const session = useSession();

  useEffect(() => {
    if (session.data?.user.role === Role.FinancialWorker)
      tableHeaders.push({
        key: "handler.name",
        label: "Behandelaar",
        filterType: FilterType.String,
      });
  }, [session]);

  return (
    <div>
      <Table
        title="Verzoeken"
        route={Route.Expenses}
        dataRoute={Route.ApiExpenses}
        headers={tableHeaders}
      />
    </div>
  );
};

Expenses.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
