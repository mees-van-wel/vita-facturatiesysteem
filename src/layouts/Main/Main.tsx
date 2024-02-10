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
  NavLink,
  Badge,
  Group,
  Button,
  ColorScheme,
} from "@mantine/core";
import Image from "next/image";
import Logo from "../../assets/images/vh-verticaal-master-png.png";
import {
  IconHome,
  IconReportMoney,
  IconLogout,
  IconUsers,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";
import { Route } from "../../enums/route.enum";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { Role } from "../../enums/role.enum";
import { useLocalStorage } from "@mantine/hooks";
interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [opened, setOpened] = useState(true);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
    defaultValue: "dark",
  });

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
            width={{ sm: 200 }}
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
                label="Verzoeken"
                icon={<IconReportMoney />}
                active={
                  router.pathname === Route.Expenses ||
                  router.pathname === Route.Expense
                }
              />
            </Link>
            {session.user.role === Role.Administrator && (
              <Link href={Route.Users} passHref>
                <NavLink
                  label="Gebruikers"
                  icon={<IconUsers />}
                  active={
                    router.pathname === Route.Users ||
                    router.pathname === Route.User
                  }
                />
              </Link>
            )}
          </Navbar>
        ) : undefined
      }
      footer={
        <Footer height={60} p="md">
          Developed by{" "}
          <Anchor href="https://www.hexa-it.nl" target="_blank">
            Hexa-IT
          </Anchor>{" "}
          - Version {process.env.APP_VERSION} ({window.__NEXT_DATA__.buildId})
        </Footer>
      }
      header={
        <Header height={{ base: 70 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
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
            <Group>
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
              <Title m={0}>Facturatiesysteem</Title>
            </Group>
            {session && (
              <Group mr="md" spacing="xs">
                <p>Ingelogd als:</p>
                <Badge size="lg">
                  {session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join(".")}
                </Badge>
                <Button
                  compact
                  variant="light"
                  title="Thema"
                  onClick={() => {
                    setColorScheme((current) =>
                      current === "dark" ? "light" : "dark"
                    );
                  }}
                >
                  {colorScheme === "dark" ? (
                    <IconSun size={16} />
                  ) : (
                    <IconMoon size={16} />
                  )}
                </Button>
                <Button
                  compact
                  variant="light"
                  color="red"
                  title="Uitloggen"
                  onClick={() => signOut()}
                >
                  <IconLogout size={16} />
                </Button>
              </Group>
            )}
          </div>
        </Header>
      }
    >
      <div>{children}</div>
    </AppShell>
  );
};
