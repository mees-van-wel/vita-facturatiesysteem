import * as jose from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("Missing JWT_SECRET in .env.local");

export const sign = <T>(data: T, expiresIn: string | number = "10m") =>
  new jose.SignJWT({ data })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(jwtSecret)) as Promise<string>;

export const verify = async (token: string) => {
  try {
    const {
      payload: { data },
    } = await jose.jwtVerify(
      token.toString(),
      new TextEncoder().encode(jwtSecret)
    );
    return data as any;
  } catch (err) {
    throw new Error("Invalid or expired token.");
  }
};
