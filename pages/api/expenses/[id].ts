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

  switch (method) {
    case "GET":
      const expense = await prisma.expense.findUniqueOrThrow({
        where: { id: parseInt(id as string) },
        include: { states: true },
      });

      res.status(200).json(expense);
      break;
    case "PUT":
      // Update or create data in your database
      //   res.status(200).json({ id, name: name || `User ${id}` });
      break;

    case "POST":
      
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
