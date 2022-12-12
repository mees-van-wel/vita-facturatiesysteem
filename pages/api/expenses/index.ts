import { Expense } from "@prisma/client";
import { NextApiResponse, NextApiRequest } from "next";
import { unstable_getServerSession } from "next-auth";
import { Role } from "../../../src/enums/role.enum";
import { prisma } from "../../../src/lib/prisma.lib";
import { authOptions } from "./../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const { page, take, filter, sort } = req.body;

  const where = Object.keys(filter).reduce<Partial<Expense>>((object, key) => {
    const reversed = key.split(".").reverse();
    const values = filter[key];

    const value = reversed.reduce(
      (res, key, index) => ({ [key]: index === 0 ? values : res }),
      {}
    );

    return { ...object, ...value };
  }, {});

  if (session.user.role !== Role.FinancialWorker)
    where["OR"] = [
      {
        createdById: { equals: session.user.id },
      },
      {
        handlerId: { equals: session.user.id },
      },
    ];

  const [count, collection] = await prisma.$transaction([
    prisma.expense.count(),
    prisma.expense.findMany({
      skip: (page - 1) * take,
      take,
      include: {
        handler: { select: { name: true } },
        company: { select: { name: true } },
        states: true,
      },
      where,
      orderBy: Object.keys(sort).map((key) => {
        const value = sort[key];
        const keys = key.split(".");
        const result = keys
          .reverse()
          .reduce(
            (res, key, index) => ({ [key]: index === 0 ? value : res }),
            {}
          );
        return result;
      }),
    }),
  ]);

  return res.status(200).json({
    count,
    collection,
  });
}
