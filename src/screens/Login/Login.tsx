import { Button, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { signIn } from "next-auth/react";
import { ReactElement, useEffect } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { MainLayout } from "../../layouts/Main";
import { modals } from "@mantine/modals";
import { PasswordResetModal } from "@/modals/PasswordResetModal";
import { useRouter } from "next/router";

interface FormValues {
  email: string;
  password: string;
}

export const Login: NextPageWithLayout = () => {
  const { asPath } = useRouter();

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

    if (!res?.ok) {
      showNotification({
        message: res?.error,
        color: "red",
      });
    } else
      showNotification({
        message: "Ingelogd",
        color: "green",
      });
  };

  const forgotPasswordHandler = () => {
    modals.open({
      title: <Title order={3}>Wachtwoord vergeten</Title>,
      children: <PasswordResetModal />,
    });
  };

  useEffect(() => {
    if (asPath.includes("reset=success"))
      showNotification({
        message: "wachtwoord gewijzigd, u kunt nu inloggen",
        color: "green",
      });

    if (asPath.includes("reset=failed"))
      showNotification({
        message: "Er is iets misgegaan, probeer het later opnieuw",
        color: "red",
      });
  }, []);

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
          autoFocus
          withAsterisk
          label="E-mail"
          type="email"
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
        <Button
          onClick={forgotPasswordHandler}
          size="sm"
          compact
          type="button"
          role="button"
          variant="light"
          fullWidth
        >
          Wachtwoord vergeten
        </Button>
      </form>
    </div>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
