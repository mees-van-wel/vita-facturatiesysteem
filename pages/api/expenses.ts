import { NextApiResponse, NextApiRequest } from "next";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../src/lib/prisma.lib";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  let { page, take, filter } = req.body;

  // await prisma.expense.create({
  //   data: {
  //     handlerId: 1,
  //     customerName: "Tony",
  //     invoiceAdres: "Invoice adres",
  //     postalCode: "Postal code",
  //     city: "City",
  //     passingDate: new Date(),
  //     notaryName: "Kleiner",
  //     companyId: 1,
  //     objectAdres: "obj adress",
  //     objectCity: "obj city",
  //     objectPostalCode: "obj Postalcode",
  //     mortgageInvoiceAmount: 534.34,
  //     insuranceInvoiceAmount: 123.4,
  //     otherInvoiceAmount: 43,
  //     signedOTDV: "signed OTDV",
  //     zzpInvoice: "ZZP INvoiec",
  //     paymentMethod: "Payment method",
  //     notes: "Notites",
  //     IBDeclaration: "IBD Delcaealasd",
  //   },
  // });

  const [count, collection] = await prisma.$transaction([
    prisma.expense.count(),
    prisma.expense.findMany({
      skip: (page - 1) * take,
      take,
      include: {
        handler: { select: { name: true } },
        company: { select: { name: true } },
      },
      where: filter,
    }),
  ]);

  return res.status(200).json({
    count,
    collection,
  });
}
