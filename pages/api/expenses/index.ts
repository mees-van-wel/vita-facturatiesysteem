import { Expense } from "@prisma/client";
import { NextApiResponse, NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { Role } from "../../../src/enums/role.enum";
import { prisma } from "../../../src/lib/prisma.lib";
import { authOptions } from "./../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const { page, take, filter, sort } = req.body;

  const statesFilter = filter.states;
  delete filter.states;

  let where: any = Object.keys(filter).reduce<Partial<Expense>>(
    (object, key) => {
      const formatFilterValue = (key: string, value: any) => {
        const reversed = key.split(".").reverse();

        return reversed.reduce(
          (res, key, index) => ({ [key]: index === 0 ? value : res }),
          {}
        );
      };

      const keyParts = key.split("||");

      if (keyParts.length > 1)
        return {
          ...object,
          OR: keyParts.map((subKey) => formatFilterValue(subKey, filter[key])),
        };

      return { ...object, ...formatFilterValue(key, filter[key]) };
    },
    {}
  );

  switch (session.user.role) {
    case Role.InternalEmployee:
      where = {
        AND: [
          {
            handler: {
              role: Role.InternalConsultant,
            },
          },
          where,
        ],
      };
      break;
    case Role.FinancialWorker:
    case Role.Administrator:
      where = where;
      break;
    default:
      where = {
        AND: [
          {
            handlerId: { equals: session.user.id },
          },
          where,
        ],
      };
  }

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

  const expenses = collection
    .filter(({ states }) =>
      statesFilter
        ? statesFilter.includes(states[states.length - 1].type)
        : true
    )
    .map((expense) => ({
      ...expense,
      isEarly: expense.passingDate
        ? expense.passingDate.getTime() < expense.createdAt.getTime()
        : undefined,
    }));

  return res.status(200).json({
    count,
    collection: expenses,
  });
}
