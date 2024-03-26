import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "@/lib/prisma.lib";
import * as argon2 from "argon2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deactivated)
    return res.status(401).send("Er bestaat geen account met dit e-mailadres");

  const validPassword = await argon2.verify(user.password, password);
  if (!validPassword) return res.status(401).send("Wachtwoord onjuist");

  return res.status(200).json(user);
}
