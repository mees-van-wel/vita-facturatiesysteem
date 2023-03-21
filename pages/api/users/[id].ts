import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../src/lib/prisma.lib";
import * as argon2 from "argon2";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const {
    query: { id },
    method,
    body,
  } = req;

  if (method === "GET") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: parseInt(id as string) },
    });

    return res.status(200).json(user);
  }

  if (method === "PUT") {
    if (body.password) body.password = await argon2.hash(body.password);
    else delete body.password;

    const user = await prisma.user.update({
      data: body,
      where: { id: parseInt(id as string) },
    });

    return res.status(200).json(user);
  }

  if (method === "POST") {
    body.password = await argon2.hash(body.password);

    const user = await prisma.user.create({
      data: body,
    });

    return res.status(200).json(user);
  }

  if (method === "DELETE") {
    await prisma.user.delete({
      where: { id: parseInt(id as string) },
    });

    res.status(200).end();
  }

  res.setHeader("Allow", ["GET", "PUT", "POST", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
