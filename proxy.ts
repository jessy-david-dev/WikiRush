import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function getDerivedEncryptionKey(secret: string, salt: string) {
  return hkdf(
    "sha256",
    secret,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    64,
  );
}

async function getEmailFromRequest(req: NextRequest): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;

  try {
    const encryptionKey = await getDerivedEncryptionKey(secret, cookieName);
    const { payload } = await jwtDecrypt(token, encryptionKey, {
      clockTolerance: 15,
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256CBC-HS512", "A256GCM"],
    });
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const email = await getEmailFromRequest(req);
  if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
