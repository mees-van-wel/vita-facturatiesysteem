import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma.lib";
import { verify } from "@/utilities/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;

  if (method !== "GET" || !query?.token) {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const data = await verify(query.token as string);

    await prisma.user.update({
      data: { password: data.newPassword },
      where: { id: data.userId },
    });

    return res.redirect("/login?reset=success");
  } catch (error) {
    console.warn(error);
    return res.redirect("/login?reset=failed");
  }
}
