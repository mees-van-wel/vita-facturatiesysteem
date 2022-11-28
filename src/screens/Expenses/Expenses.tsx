import { Title } from "@mantine/core";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { MainLayout } from "../../layouts/Main";

export const Expenses: NextPageWithLayout = ({ expenses }) => {
  console.log(expenses);

  return (
    <div>
      <Title>Expenses</Title>
    </div>
  );
};

Expenses.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
