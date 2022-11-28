import withAuth, { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Route } from "./src/enums/route.enum";

export async function middleware(request: NextRequestWithAuth) {
  const a = await withAuth(request);

  if (request.nextUrl.pathname === Route.Login) {
    return !!a
      ? NextResponse.next()
      : NextResponse.rewrite(new URL(Route.Home));
  }

  return a;
}
