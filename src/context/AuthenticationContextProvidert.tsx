import { useDidUpdate } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { Route } from "../enums/route.enum";

interface AuthenticationContextProviderProps {
  children: ReactNode;
}

export const AuthenticationContextProvider = ({
  children,
}: AuthenticationContextProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useDidUpdate(() => {
    if (status !== "loading")
      (async () => {
        if (status !== "authenticated" && router.route !== Route.Login)
          await router.replace(Route.Login);

        if (status === "authenticated" && router.route === Route.Login)
          await router.replace(Route.Home);

        setIsReady(true);
      })();
  }, [status]);

  if (!isReady) return null;

  return <>{children}</>;
};
