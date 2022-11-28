import { Anchor, Button, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { Route } from "../../enums/route.enum";
import { MainLayout } from "../../layouts/Main";

interface FormValues {
  email: string;
  password: string;
}

export const Login = () => {
  const router = useRouter();

  // useEffect(() => {
  //   if (!!session.data) router.replace(Route.Home);
  // }, []);

  const form = useForm<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler = async ({ email, password }: FormValues) => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res?.ok)
      showNotification({
        message: "Gebruiker niet gevonden",
        color: "red",
      });
    else
      showNotification({
        message: "Ingelogd",
        color: "green",
      });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Title order={2}>Je bent nog niet ingelogd</Title>
      <form onSubmit={form.onSubmit(submitHandler)}>
        <TextInput
          withAsterisk
          label="E-mail"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          withAsterisk
          label="Wachtwoord"
          {...form.getInputProps("password")}
        />
        <Button size="md" my="md" type="submit" fullWidth>
          Inloggen
        </Button>
      </form>
      <Anchor>Wachtwoord vergeten</Anchor>
    </div>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
