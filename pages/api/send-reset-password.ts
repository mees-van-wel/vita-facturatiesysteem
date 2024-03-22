import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma.lib";
import { sendMail } from "./expenses/[id]";
import { sign } from "@/utilities/jwt";
import * as argon2 from "argon2";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  (async () => {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) return;
    const newPassword = await argon2.hash(body.newPassword);

    const token = await sign({
      userId: user.id,
      newPassword,
    });

    await sendMail({
      name: user.name,
      email: user.email,
      title: "Nieuw wachtwoord bevestigen",
      buttonUrl: `https://portaal.werkenbijvitahypotheekadvies.nl/api/confirm-reset-password?token=${token}`,
      buttonText: "Bevestigen",
      content:
        "Je hebt een verzoek ingediend om je wachtwoord te resetten. Gebruik de onderstaande knop om je nieuwe wachtwoord te bevestigen. De link is 10 minuten geldig.",
    });
  })();

  return res.status(200).json({});
}
