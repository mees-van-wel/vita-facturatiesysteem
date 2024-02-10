import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { bucketName, s3Client } from "@/utilities/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

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

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).send("Je moet ingelogd zijn");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `uploaded-pdfs/${fileName}`,
  });

  try {
    const { Body, ContentLength } = await s3Client.send(command);
    if (!Body) return res.status(500).end(`s3 Body is empty`);
    if (!ContentLength) return res.status(500).end(`s3 ContentLength is empty`);

    const readable = Readable.from(Body as Readable);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", ContentLength);
    res.setHeader("Content-Disposition", `inline; filename=${fileName}`);

    readable.pipe(res);
  } catch (error) {
    return res.status(404).send("Dit bestand kan niet worden gevonden.");
  }
}
