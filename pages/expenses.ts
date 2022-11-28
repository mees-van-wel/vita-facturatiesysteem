import { GetServerSideProps } from "next";
import { prisma } from "../src/lib/prisma.lib";
import { Expenses } from "../src/screens/Expenses";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const expenses = await prisma.expense.findMany();

  return {
    props: {
      expenses,
    },
  };
};

export default Expenses;
