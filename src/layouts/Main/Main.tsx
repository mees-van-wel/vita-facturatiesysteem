import { ReactNode, useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  MediaQuery,
  Burger,
  useMantineTheme,
  Anchor,
  Title,
  Button,
  NavLink,
  TextInput,
  PasswordInput,
} from "@mantine/core";
import Image from "next/image";
import Logo from "../../assets/images/vh-verticaal-master-png.png";
import { IconHome, IconReportMoney, IconLogout } from "@tabler/icons";
import Link from "next/link";
import { Route } from "../../enums/route.enum";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        session ? (
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 200, lg: 300 }}
          >
            <Link href={Route.Home} passHref>
              <NavLink
                label="Home"
                icon={<IconHome />}
                active={router.pathname === Route.Home}
              />
            </Link>
            <Link href={Route.Expenses} passHref>
              <NavLink
                label="Declaraties"
                icon={<IconReportMoney />}
                active={router.pathname === Route.Expenses}
              />
            </Link>
            <NavLink
              onClick={() => signOut()}
              label="Uitloggen"
              icon={<IconLogout />}
            />
          </Navbar>
        ) : undefined
      }
      // aside={
      //   <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      //     <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      //       <Text>Application sidebar</Text>
      //     </Aside>
      //   </MediaQuery>
      // }
      footer={
        <Footer height={60} p="md">
          Developed by{" "}
          <Anchor href="https://www.hexa-it.nl" target="_blank">
            Hexa-IT
          </Anchor>{" "}
          - Version 1.0.0
        </Footer>
      }
      header={
        <Header height={{ base: 50, md: 70 }}>
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 8,
                margin: 8,
                backgroundColor: "white",
                borderRadius: 100,
              }}
            >
              <Image src={Logo} width={30} alt="Logo" />
            </div>
            <Title>Facturatiesysteem</Title>
          </div>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
};
