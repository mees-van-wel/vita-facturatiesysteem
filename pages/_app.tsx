import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Barlow } from "next/font/google";
import Head from "next/head";
import { ColorScheme, MantineProvider } from "@mantine/core";
import { ReactElement, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NextPage } from "next";
import { Notifications } from "@mantine/notifications";
import { AuthenticationContextProvider } from "../src/context/AuthenticationContextProvidert";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalsProvider } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";

const inter = Barlow({ weight: "400", subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [colorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
    defaultValue: "dark",
  });

  return (
    <>
      <Head>
        <title>Vita Facturatiesysteem</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <style jsx global>{`
        body {
          font-family: ${inter.style.fontFamily};
        }

        p {
          font-size: 16px;
        }
      `}</style>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme,
          fontFamily: inter.style.fontFamily,
        }}
      >
        <Notifications position="top-right" />
        <ModalsProvider>
          <SessionProvider session={session}>
            <AuthenticationContextProvider>
              <QueryClientProvider client={queryClient}>
                {getLayout(<Component {...pageProps} />)}
              </QueryClientProvider>
            </AuthenticationContextProvider>
          </SessionProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}
