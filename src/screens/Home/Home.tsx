import { Title } from "@mantine/core";
import { useSession } from "next-auth/react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { MainLayout } from "../../layouts/Main";

export const Home: NextPageWithLayout = () => {
  const { data: session } = useSession();

  return (
    <div>
      <Title>Home</Title>
      <p>Goedendag {session?.user?.name}</p>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
