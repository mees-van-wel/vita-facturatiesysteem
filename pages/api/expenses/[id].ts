import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma.lib";
import formidable from "formidable";
import slugify from "slugify";
import { Expense } from "@prisma/client";
import { ExpenseState } from "@/enums/expenseState.enum";
import { readFile, unlink } from "fs/promises";
import crypto from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3Client } from "@/utilities/s3Client";

const generateRandomHash = () => {
  const randomBytes = crypto.randomBytes(16);
  const hash = crypto.createHash("sha256").update(randomBytes).digest("hex");
  return hash;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
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
      isEarly: expense.passingDate
        ? expense.passingDate.getTime() < expense.createdAt.getTime()
        : undefined,
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

    await Promise.all(
      Object.keys(data.files).map(async (key) => {
        const file = data.files[key] as formidable.File;

        const expense = await prisma.expense.findUnique({
          select: { [key]: true },
          where: { id: parseInt(id as string) },
        });

        const currentFilename = expense?.[key as keyof Expense];

        // @ts-ignore
        if (!expense || file.originalFilename === currentFilename) return;

        if (currentFilename)
          try {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: bucketName,
                Key: `uploaded-pdfs/${currentFilename}`,
              })
            );
          } catch (error) {
            console.log("File not found while trying to delete old file");
          }

        const hash = generateRandomHash();
        const newFilename = file.originalFilename
          ? `${slugify(file.originalFilename.split(".pdf")[0])}_${hash}.pdf`
          : `${hash}.pdf`;

        // @ts-ignore
        update[key] = newFilename;

        const fileData = await readFile(file.filepath);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: `uploaded-pdfs/${newFilename}`,
            Body: fileData,
          })
        );

        await unlink(file.filepath);
      })
    );

    if (data.fields.handlerId)
      update.handlerId = parseInt(data.fields.handlerId as string);

    if (data.fields.companyId)
      update.companyId = parseInt(data.fields.companyId as string);

    if (update.starterLoan)
      // @ts-ignore
      update.starterLoan = JSON.parse(data.fields.starterLoan);

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

    console.log(update);

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

        if (!!value && value !== "null" && value !== "undefined")
          // @ts-ignore
          object[key] = value;

        return object;
      }, {}),
    };

    await Promise.all(
      Object.keys(data.files).map(async (key) => {
        const file = data.files[key] as formidable.File;

        const hash = generateRandomHash();
        const newFilename = file.originalFilename
          ? `${slugify(file.originalFilename.split(".pdf")[0])}_${hash}.pdf`
          : `${hash}.pdf`;

        // @ts-ignore
        update[key] = newFilename;

        const fileData = await readFile(file.filepath);

        // await writeFile(`src/uploads/${newFilename}`, fileData);
        console.log("Writing object, create");
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: `uploaded-pdfs/${newFilename}`,
            Body: fileData,
          })
        );

        await unlink(file.filepath);
      })
    );

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

    if (update.starterLoan)
      // @ts-ignore
      update.starterLoan = JSON.parse(data.fields.starterLoan);

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
