import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { useState } from "react";

export const PasswordResetModal = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, { toggle }] = useDisclosure(false);

  const resetHandler = async () => {
    setLoading(true);

    await axios.post("/api/send-reset-password", {
      email,
      newPassword,
    });

    setLoading(false);

    modals.closeAll();

    showNotification({
      message: "Als uw account bestaat ontvangt u een bevestigingsmail",
      color: "green",
    });
  };

  return (
    <Stack spacing="sm">
      <TextInput
        value={email}
        onChange={(e) => {
          setEmail(e.currentTarget.value.toLowerCase());
        }}
        label="E-mail"
        type="email"
        data-autofocus
        withAsterisk
      />
      <PasswordInput
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.currentTarget.value);
        }}
        label="Nieuw wachtwoord"
        withAsterisk
        visible={visible}
        onVisibilityChange={toggle}
      />
      <PasswordInput
        value={newPasswordRepeat}
        onChange={(e) => {
          setNewPasswordRepeat(e.currentTarget.value);
        }}
        label="Herhaal nieuw wachtwoord"
        withAsterisk
        error={
          newPassword !== newPasswordRepeat
            ? "Wachtwoorden komen niet overeen"
            : undefined
        }
        visible={visible}
        onVisibilityChange={toggle}
      />
      <Button
        disabled={!newPassword || !email || newPassword !== newPasswordRepeat}
        fullWidth
        onClick={resetHandler}
        loading={loading}
      >
        Stuur bevestigingsmail
      </Button>
    </Stack>
  );
};
