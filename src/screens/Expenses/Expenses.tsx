import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Table, { TableHeaders } from "../../components/Table/Table";
import { FilterType } from "../../enums/filterType.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";

const tableHeaders: TableHeaders = [
  {
    key: "id",
    label: "ID",
    filterType: FilterType.Number,
  },
  {
    key: "submitted",
    label: "Ingediend",
  },
  {
    key: "billed",
    label: "Gefactureerd",
  },
  {
    key: "handler.name",
    label: "Behandelaar",
  },
  {
    key: "customerName",
    label: "Naam klant",
    filterType: FilterType.String,
  },
  {
    key: "objectAdres",
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
    format: (date) => new Date(date).toLocaleString("nl-NL"),
  },
  {
    key: "company.name",
    label: "Maatschappij",
  },
  {
    key: "mortgageInvoiceAmount",
    label: "Bedrag hypotheek",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
  },
  {
    key: "insuranceInvoiceAmount",
    label: "Bedrag verzekering",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
  },
  {
    key: "otherInvoiceAmount",
    label: "Bedrag overige",
    format: (number: number) =>
      new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(number),
  },
];

export const Expenses: NextPageWithLayout = () => {
  return (
    <div>
      <Table
        title="Verzoeken"
        route={Route.ApiExpenses}
        headers={tableHeaders}
      />
    </div>
  );
};

Expenses.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
