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
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const transporter = nodemailer.createTransport({
  host: "mail.werkenbijvitahypotheekadvies.nl",
  port: 587,
  secure: false,
  auth: {
    user: "facturatie@werkenbijvitahypotheekadvies.nl",
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

type sendMailProps = {
  name: string;
  email: string;
  title: string;
  buttonUrl: string;
  buttonText: string;
  content: string;
};

export const sendMail = async ({
  name,
  email,
  title,
  buttonUrl,
  buttonText,
  content = title,
}: sendMailProps) => {
  try {
    return await transporter.sendMail({
      from: "Vita Facturatiesysteem <facturatie@werkenbijvitahypotheekadvies.nl>",
      to: `${name} <${email}>`,
      subject: title,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 2rem;
      background-color: #f6f6f6;
    }

    .container {
      background-color: #ffffff;
      max-width: 600px;
      border-top: 2px solid #061d3d;
      border-left: 2px solid #061d3d;
      border-right: 2px solid #061d3d;
      border-radius: 1rem;
      overflow: hidden;
      margin: 0 auto;
    }

    .header {
      padding: 2rem;
      text-align: center;
      border-bottom: 2px dashed #061d3d;
    }

    .body-content {
      color: #061d3d;
      font-size: 1.1rem;
      padding: 2rem;
    }

    .footer {
      background-color: #061d3d;
      color: #ffffff;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img style="width:100%;max-width:250px;"
        src="https://vitahypotheekadvies.nl/wp-content/uploads/2023/01/vita-hypotheekadvies_logo.svg" />
    </div>
    <div class="body-content">
      <p>${content}</p>
      <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 1.5rem;">
        <tr>
          <td>
            <table cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" width="200" height="40" bgcolor="#e10039"
                  style="border-radius: 0.5rem; color: #ffffff; display: block;">
                  <a href="${buttonUrl}"
                    style="font-size: 16px; font-weight: bold; font-family: Sans-serif; text-decoration: none; color: #ffffff; line-height:40px; width:100%; display:inline-block">${buttonText}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    <div class="footer">Vita Facturatiesysteem</div>
  </div>
</body>
</html>`,
    });
  } catch (error) {
    console.log("Mail error", error);
  }
};

const generateRandomHash = () => {
  const randomBytes = crypto.randomBytes(16);
  const hash = crypto.createHash("sha256").update(randomBytes).digest("hex");
  return hash;
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
            console.warn("File not found while trying to delete old file");
          }

        const hash = generateRandomHash();
        const newFilename = file.originalFilename
          ? `${slugify(file.originalFilename.split(".pdf")[0], {
              lower: true,
              strict: true,
            })}_${hash}.pdf`
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

    if (data.fields.handlerId && update.handlerId)
      update.handlerId = parseInt(data.fields.handlerId as string);

    if (data.fields.companyId && update.companyId)
      update.companyId = parseInt(data.fields.companyId as string);

    if (update.starterLoan && data.fields.starterLoan)
      // @ts-ignore
      update.starterLoan = JSON.parse(data.fields.starterLoan);

    if (update.passingDate && data.fields.passingDate)
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

    (async () => {
      const handler = await prisma.user.findFirstOrThrow({
        where: { id: expense.handlerId },
      });

      const customerName = `${expense.customerInitials} ${
        expense.customerPrefix
          ? `${expense.customerPrefix} ${expense.customerLastName}`
          : expense.customerLastName
      }`;

      // @ts-ignore
      if (update.states?.create.type === ExpenseState.Rejected)
        await sendMail({
          name: handler.name,
          email: handler.email,
          title: `Factuurverzoek "${customerName}" is Afgekeurd`,
          buttonUrl: `https://portaal.werkenbijvitahypotheekadvies.nl/expenses/${id}`,
          buttonText: "Bekijk verzoek",
          // @ts-ignore,
          content: `Uw factuurverzoek betreffende ${expense.customerSalutation} ${customerName} is afgekeurd om de volgende reden: "${update.states.create.notes}".`,
        });

      // @ts-ignore
      if (update.states?.create.type === ExpenseState.Approved)
        await sendMail({
          name: handler.name,
          email: handler.email,
          title: `Factuurverzoek "${customerName}" is Goedgekeurd`,
          buttonUrl: `https://portaal.werkenbijvitahypotheekadvies.nl/expenses/${id}`,
          buttonText: "Bekijk verzoek",
          content: `Uw factuurverzoek betreffende ${expense.customerSalutation} ${customerName} is goedgekeurd.`,
        });

      // @ts-ignore
      if (update.states?.create.type === ExpenseState.Completed)
        await sendMail({
          name: handler.name,
          email: handler.email,
          title: `Factuurverzoek "${customerName}" is Uitgevoerd`,
          buttonUrl: `https://portaal.werkenbijvitahypotheekadvies.nl/expenses/${id}`,
          buttonText: "Bekijk verzoek",
          content: `Uw factuurverzoek betreffende ${expense.customerSalutation} ${customerName} is uitgevoerd.`,
        });
    })();

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
          ? `${
              (slugify(file.originalFilename.split(".pdf")[0]),
              {
                lower: true,
                strict: true,
              })
            }_${hash}.pdf`
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

    // @ts-ignore
    update.createdBy = {
      connect: {
        id: session.user.id,
      },
    };

    if (data.fields.handlerId && update.handlerId) {
      delete update.handlerId;
      // @ts-ignore
      update.handler = {
        connect: {
          id: parseInt(data.fields.handlerId as string),
        },
      };
    }

    if (data.fields.companyId && update.companyId) {
      delete update.companyId;
      // @ts-ignore
      update.company = {
        connect: {
          id: parseInt(data.fields.companyId as string),
        },
      };
    }

    if (update.starterLoan && data.fields.starterLoan)
      // @ts-ignore
      update.starterLoan = JSON.parse(data.fields.starterLoan);

    if (update.passingDate && data.fields.passingDate)
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
