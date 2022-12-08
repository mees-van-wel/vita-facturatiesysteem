import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { TableHeaders } from "../../components/Table";
import Table from "../../components/Table/Table";
import { FilterType } from "../../enums/filterType.enum";
import { Role, roleLabel } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";

const tableHeaders: TableHeaders = [
  {
    key: "id",
    label: "ID",
    filterType: FilterType.Number,
  },
  {
    key: "name",
    label: "Naam",
    filterType: FilterType.String,
  },
  {
    key: "email",
    label: "E-mail",
    filterType: FilterType.String,
  },
  {
    key: "role",
    label: "Role",
    format: (value: Role) => roleLabel[value],
    filterType: FilterType.String,
  },
  {
    key: "createdAt",
    label: "Gemaakt op",
    format: (date) => new Date(date).toLocaleString("nl-NL"),
    filterType: FilterType.Date,
  },
];

export const Users: NextPageWithLayout = () => {
  return (
    <div>
      <Table
        title="Gebruikers"
        route={Route.Users}
        dataRoute={Route.ApiUsers}
        headers={tableHeaders}
      />
    </div>
  );
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
