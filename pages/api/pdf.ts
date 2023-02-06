import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import fs from "fs";

export default async function pdfHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { fileName },
    method,
  } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!fileName) return res.status(400).end(`fileName is missing`);

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const file = fs.createReadStream(`src/uploads/${fileName}`);
  const stat = fs.statSync(`src/uploads/${fileName}`);

  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${fileName}`);

  file.pipe(res);
}
