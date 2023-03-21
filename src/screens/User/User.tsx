import {
  Button,
  Group,
  Loader,
  PasswordInput,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { closeModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { User as UserInterface } from "@prisma/client";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconLockOpen,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { Role, role, roleLabel } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";
import { query } from "../../lib/query.lib";
import { NEW, requiredValidation } from "../Expense";

export const User: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const session = useSession();

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
  password: string;
}

const roleData = role.map(({ value }) => ({
  label: roleLabel[value as Role],
  value,
}));

const Form = ({ user }: FormProps) => {
  const router = useRouter();
  const id = router.query.id as string;

  const changePassword = useMutation({
    mutationFn: (params: {}) =>
      axios.put<UserInterface>(`${Route.ApiUsers}/${id}`, params),
  });

  const createUser = useMutation({
    mutationFn: (params: FormValues) =>
      axios.post<UserInterface>(`${Route.ApiUsers}/${id}`, params),
  });

  const updateUser = useMutation({
    mutationFn: (params: FormValues) =>
      axios.put<UserInterface>(`${Route.ApiUsers}/${id}`, params),
  });

  const deleteUser = useMutation({
    mutationFn: () => axios.delete(`${Route.ApiUsers}/${id}`),
  });

  const form = useForm<FormValues>({
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "",
      password: "",
    },
    validate: {
      name: requiredValidation,
      email: requiredValidation,
      role: requiredValidation,
      password: !user ? requiredValidation : undefined,
    },
  });

  const submitHandler = (values: FormValues) => {
    if (user)
      updateUser.mutate(values, {
        onSuccess: () => {
          form.resetDirty();

          showNotification({
            message: "Opgeslagen",
            color: "green",
          });
        },
      });
    else
      createUser.mutate(values, {
        onSuccess: ({ data }) => {
          form.resetDirty();

          router.push(`${Route.Users}/${data.id}`);

          showNotification({
            message: "Opgeslagen",
            color: "green",
          });
        },
      });
  };

  const changePasswordHandler = (password: string, onSuccess: () => void) => {
    changePassword.mutate({ password }, { onSuccess });
  };

  const openChangePasswordModal = () =>
    openModal({
      title: "Wachtwoord wijzigen",
      modalId: "change-password",
      children: <ChangePasswordModal onSubmit={changePasswordHandler} />,
    });

  const deleteHandler = () => {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        router.push(Route.Users);
      },
    });
  };

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
            <Button
              leftIcon={<IconLockOpen />}
              onClick={openChangePasswordModal}
              variant="light"
            >
              Wachtwoord wijzigen
            </Button>
            <Button
              onClick={deleteHandler}
              leftIcon={<IconTrash />}
              color="red"
              variant="light"
            >
              Verwijderen
            </Button>
          </>
        )}
      </Group>
      <Select
        label="Rol"
        withAsterisk
        data={roleData}
        {...form.getInputProps("role")}
      />
      <TextInput label="Naam" withAsterisk {...form.getInputProps("name")} />
      <TextInput
        type="email"
        label="E-mail"
        withAsterisk
        {...form.getInputProps("email")}
      />
      {!user && (
        <PasswordInput
          label="Wachtwoord"
          withAsterisk
          {...form.getInputProps("password")}
        />
      )}
    </form>
  );
};

interface ChangePasswordModalProps {
  onSubmit: (password: string, onSuccess: () => void) => void;
}

const ChangePasswordModal = ({ onSubmit }: ChangePasswordModalProps) => {
  const [password, setPassword] = useState("");

  return (
    <Group align="end">
      <PasswordInput
        label="Nieuw wachtwoord"
        value={password}
        style={{
          flexGrow: 1,
        }}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      {password && (
        <Button
          style={{
            flexGrow: 0,
          }}
          onClick={() => {
            onSubmit(password, () => {
              setPassword("");
              closeModal("change-password");
              showNotification({
                message: "Wachtwoord gewijzigd",
                color: "green",
              });
            });
          }}
          leftIcon={<IconDeviceFloppy />}
        >
          Opslaan
        </Button>
      )}
    </Group>
  );
};

User.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
