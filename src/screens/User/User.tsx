import { Button, Group, Loader, Select, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { User as UserInterface } from "@prisma/client";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconLockOpen,
  IconTrash,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { role, roleLabel } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";
import { query } from "../../lib/query.lib";
import { NEW, requiredValidation } from "../Expense";

export const User: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: user } = useQuery({
    ...query<UserInterface>({
      route: `${Route.ApiUsers}/${id}`,
      method: "GET",
    }),
    enabled: id !== NEW,
  });

  return <div>{user || id === NEW ? <Form user={user} /> : <Loader />}</div>;
};

interface FormProps {
  user?: UserInterface;
}

interface FormValues {
  name: string;
  email: string;
  role: string;
}

const roleData = role.map(({ value }) => ({
  label: roleLabel[value],
  value,
}));

const Form = ({ user }: FormProps) => {
  const form = useForm<FormValues>({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "",
    },
    validate: {
      name: requiredValidation,
      email: requiredValidation,
      role: requiredValidation,
    },
  });

  const submitHandler = (values: FormValues) => {};

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <Group>
        <Title>Gebruiker</Title>
        <Link href={Route.Users}>
          <Button leftIcon={<IconArrowBack />}>Terug</Button>
        </Link>
        {form.isDirty() && (
          <Button leftIcon={<IconDeviceFloppy />} type="submit">
            Opslaan
          </Button>
        )}
        {user && (
          <>
            <Button leftIcon={<IconLockOpen />} variant="light">
              Wachtwoord wijzigen
            </Button>
            <Button leftIcon={<IconTrash />} color="red" variant="light">
              Verwijderen
            </Button>
          </>
        )}
      </Group>
      <TextInput label="Naam" withAsterisk {...form.getInputProps("name")} />
      <TextInput
        type="email"
        label="E-mail"
        withAsterisk
        {...form.getInputProps("email")}
      />
      <Select
        label="Rol"
        withAsterisk
        data={roleData}
        {...form.getInputProps("role")}
      />
    </form>
  );
};

User.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
