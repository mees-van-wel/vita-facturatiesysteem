import { Badge } from "@mantine/core";
import { State } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ReactElement, useEffect, useMemo, useState } from "react";
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

export const Expenses: NextPageWithLayout = () => {
  const session = useSession();

  const tableHeaders: TableHeaders = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        filterType: FilterType.Number,
      },
      {
        key: "states",
        label: "Status",
        filterType: FilterType.Status,
        noSort: true,
        format: (states: State[]) => (
          <Badge
            size="lg"
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
      ...(session.data?.user.role === Role.InternalEmployee ||
      session.data?.user.role === Role.FinancialWorker ||
      session.data?.user.role === Role.Administrator
        ? [
            {
              key: "handler.name",
              label: "Behandelaar",
              filterType: FilterType.String,
            },
          ]
        : []),
      {
        key: "isEarly",
        label: "Te laat",
        format: (isEarly: boolean) =>
          isEarly !== undefined ? (
            <Badge size="lg">{isEarly ? "Ja" : "Nee"}</Badge>
          ) : (
            "N.V.T."
          ),
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
        show: false,
        key: "customerSalutation",
        label: "Aanhef klant",
      },
      {
        show: false,
        key: "customerInitials",
        label: "Voorletters klant",
      },
      {
        show: false,
        key: "customerPrefix",
        label: "Tussenvoegsel klant",
      },
      {
        key: "customerLastName",
        label: "Achternaam klant",
        filterType: FilterType.String,
      },
      {
        key: "customerEmail",
        label: "E-mail klant",
        filterType: FilterType.String,
      },
      {
        show: false,
        key: "secondCustomerSalutation",
        label: "Aanhef 2e klant",
      },
      {
        show: false,
        key: "secondCustomerInitials",
        label: "Voorletters 2e klant",
      },
      {
        show: false,
        key: "secondCustomerPrefix",
        label: "Tussenvoegsel 2e klant",
      },
      {
        show: false,
        key: "secondCustomerLastName",
        label: "Achternaam 2e klant",
      },
      {
        show: false,
        key: "secondCustomerEmail",
        label: "E-mail 2e klant",
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
        format: (date) =>
          date ? new Date(date).toLocaleDateString("nl-NL") : "N.V.T.",
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
        format: (paymentMethod: PaymentMethod) =>
          PaymentMethodLabel[paymentMethod],
      },
      {
        show: false,
        key: "IBDeclaration",
        label: "IB-aangifte door partner",
        format: (iBDeclaration: IBDeclaration) =>
          IBDeclarationLabel[iBDeclaration],
      },
    ],
    [session.data?.user.role]
  );

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
