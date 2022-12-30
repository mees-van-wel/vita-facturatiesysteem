import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../src/lib/prisma.lib";
import formidable from "formidable";
import slugify from "slugify";
import { Expense } from "@prisma/client";
import { ExpenseState } from "../../../src/enums/expenseState.enum";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const expense = await prisma.expense.findUniqueOrThrow({
      where: { id: parseInt(id as string) },
      include: { states: true },
    });

    return res.status(200).json({
      ...expense,
      isEarly: expense.passingDate.getTime() < expense.createdAt.getTime(),
    });
  }

  if (method === "PUT") {
    const data = await new Promise<{
      err: any;
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) reject({ err });
        resolve({ err, fields, files });
      });
    });

    const update: Partial<Expense> = {
      ...Object.keys(data.fields).reduce((object, key) => {
        const value = data.fields[key];

        // @ts-ignore
        object[key] =
          !value || value === "null" || value === "undefined" ? null : value;

        return object;
      }, {}),
    };

    Object.keys(data.files).map((key) => {
      const file = data.files[key] as formidable.File;

      if (!file) return;

      const fileName = file.originalFilename
        ? `${slugify(file.originalFilename.split(".pdf")[0])}_${
            file.newFilename
          }.pdf`
        : `${file.newFilename}.pdf`;

      // @ts-ignore
      update[key] = fileName;

      const fileData = fs.readFileSync(file.filepath);
      fs.writeFileSync(`public/upload/${fileName}`, fileData);
      fs.unlinkSync(file.filepath);
    });

    if (data.fields.handlerId)
      update.handlerId = parseInt(data.fields.handlerId as string);

    if (data.fields.companyId)
      update.companyId = parseInt(data.fields.companyId as string);

    if (data.fields.passingDate)
      update.passingDate = new Date(data.fields.passingDate as string);

    if (!data.fields.states)
      // @ts-ignore
      update.states = {
        create: {
          type: ExpenseState.Resubmitted,
        },
      };

    // @ts-ignore
    if (data.fields.states?.create.type === ExpenseState.Completed)
      update.completedAt = new Date();

    const expense = await prisma.expense.update({
      data: update,
      where: { id: parseInt(id as string) },
      include: { states: true },
    });

    return res.status(200).json(expense);
  }

  if (method === "POST") {
    const data = await new Promise<{
      err: any;
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) reject({ err });
        resolve({ err, fields, files });
      });
    });

    const update: Partial<Expense> = {
      ...Object.keys(data.fields).reduce((object, key) => {
        const value = data.fields[key];

        // @ts-ignore
        object[key] =
          !value || value === "null" || value === "undefined" ? null : value;

        return object;
      }, {}),
    };

    Object.keys(data.files).forEach((key) => {
      const file = data.files[key] as formidable.File;

      const fileName = file.originalFilename
        ? `${slugify(file.originalFilename.split(".pdf")[0])}_${
            file.newFilename
          }.pdf`
        : `${file.newFilename}.pdf`;

      // @ts-ignore
      update[key] = fileName;

      const fileData = fs.readFileSync(file.filepath);
      fs.writeFileSync(`public/uploads/${fileName}`, fileData);
      fs.unlinkSync(file.filepath);
    });

    // @ts-ignore
    update.createdBy = {
      connect: {
        id: session.user.id,
      },
    };

    if (data.fields.handlerId) {
      delete update.handlerId;
      // @ts-ignore
      update.handler = {
        connect: {
          id: parseInt(data.fields.handlerId as string),
        },
      };
    }

    if (data.fields.companyId) {
      delete update.companyId;
      // @ts-ignore
      update.company = {
        connect: {
          id: parseInt(data.fields.companyId as string),
        },
      };
    }

    if (data.fields.passingDate)
      update.passingDate = new Date(data.fields.passingDate as string);

    const expense = await prisma.expense.create({
      // @ts-ignore
      data: {
        ...update,
        states: {
          create: {
            type: ExpenseState.Submitted,
          },
        },
      },
      include: { states: true },
    });

    return res.status(200).json(expense);
  }

  res.setHeader("Allow", ["GET", "PUT", "POST", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
