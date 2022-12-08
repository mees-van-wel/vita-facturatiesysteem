import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../src/lib/prisma.lib";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const {
    query: { id },
    method,
  } = req;

  if (method === "GET") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: parseInt(id as string) },
    });

    return res.status(200).json(user);
  }

  // if (method === "PUT") {
  // }

  // if (method === "POST") {
  // }

  res.setHeader("Allow", ["GET", "PUT", "POST", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
