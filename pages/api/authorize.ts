import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../../src/lib/prisma.lib";
import * as argon2 from "argon2";
import { Role } from "../../src/enums/role.enum";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const { email, password } = req.body;

  // await prisma.user.delete({ where: { email: "a@vita.nl" } });

  // const usera = await prisma.user.create({
  //   data: {
  //     role: Role.Administrator,
  //     name: "A",
  //     email: "a@vita.nl",
  //     password: await argon2.hash("lol"),
  //   },
  // });

  // console.log(usera);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!!user && (await argon2.verify(user.password, password)))
    return res.status(200).json(user);

  return res.status(401).send("Ongeldige inloggegevens");
}
