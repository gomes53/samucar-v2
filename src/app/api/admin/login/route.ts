import { NextResponse } from "next/server";
import { createAdminSession, setAdminSessionCookie, validateAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.password !== "string" || !validateAdminPassword(body.password)) {
      return NextResponse.json({ error: "Palavra-passe incorreta." }, { status: 401 });
    }
    const session = createAdminSession();
    await setAdminSessionCookie(session.value, session.maxAge);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao iniciar sessão." }, { status: 500 });
  }
}
