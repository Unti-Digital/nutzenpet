import { NextResponse, type NextRequest } from "next/server";

const passwordResetKeyCookie = "nutzen_password_reset_key";
const passwordResetLoginCookie = "nutzen_password_reset_login";

export function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim() ?? "";
  const login = request.nextUrl.searchParams.get("login")?.trim() ?? "";
  const destination = new URL("/conta/redefinir-senha", request.url);
  const validShape = key.length >= 20 && key.length <= 200 && login.length > 0 && login.length <= 100;
  destination.searchParams.set("status", validShape ? "ready" : "invalid");

  const response = NextResponse.redirect(destination);
  if (validShape) {
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/reset-password",
      maxAge: 60 * 30,
    };
    response.cookies.set(passwordResetKeyCookie, key, cookieOptions);
    response.cookies.set(passwordResetLoginCookie, login, cookieOptions);
  }
  return response;
}
