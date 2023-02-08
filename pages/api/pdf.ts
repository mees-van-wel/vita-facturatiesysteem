import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { open } from "node:fs/promises";

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

  try {
    const file = await open(`src/uploads/${fileName}`);
    const stat = await file.stat();
    const readStream = file.createReadStream();

    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${fileName}`);

    readStream.pipe(res);
  } catch (error) {
    return res.status(404).send("Dit bestand kan niet worden gevonden.");
  }
}
