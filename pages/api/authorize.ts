import { User } from "@prisma/client";
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../../src/lib/prisma.lib";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<User> | string>
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const { email, password } = req.body;

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  return user.password !== password || !user
    ? res.status(400).send("Ongeldige inloggegevens")
    : res.status(200).json(user);
}
