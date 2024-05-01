import { NextApiResponse, NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma.lib";
import { authOptions } from "./../auth/[...nextauth]";
import { TableCount } from "@/enums/tableCount.enum";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const { page, take, filter, sort } = req.body;

  const where = filter
    ? Object.keys(filter).reduce((object, key) => {
        const reversed = key.split(".").reverse();
        const values = filter[key];

        const value = reversed.reduce(
          (res, key, index) => ({ [key]: index === 0 ? values : res }),
          {}
        );

        return { ...object, ...value };
      }, {})
    : undefined;

  const [count, collection] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      skip:
        take === TableCount.All
          ? undefined
          : page
          ? (page - 1) * (take ?? 0)
          : undefined,
      take: take === TableCount.All ? undefined : take,
      where,
      orderBy: sort
        ? Object.keys(sort).map((key) => {
            const value = sort[key];
            const keys = key.split(".");
            const result = keys
              .reverse()
              .reduce(
                (res, key, index) => ({ [key]: index === 0 ? value : res }),
                {}
              );
            return result;
          })
        : undefined,
    }),
  ]);

  return res.status(200).json({
    count,
    collection,
  });
}
