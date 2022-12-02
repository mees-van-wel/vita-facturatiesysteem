import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Barlow } from "@next/font/google";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { ReactElement, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NextPage } from "next";
import { NotificationsProvider } from "@mantine/notifications";
import { AuthenticationContextProvider } from "../src/context/AuthenticationContextProvidert";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const inter = Barlow({ weight: "400", subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

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
      `}</style>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
          fontFamily: inter.style.fontFamily,
        }}
      >
        <NotificationsProvider position="top-right">
          <SessionProvider session={session}>
            <AuthenticationContextProvider>
              <QueryClientProvider client={queryClient}>
                {getLayout(<Component {...pageProps} />)}
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </AuthenticationContextProvider>
          </SessionProvider>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
