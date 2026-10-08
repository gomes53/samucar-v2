import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { saveVehicle } from "@/lib/vehicles";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const vehicle = await saveVehicle(await request.json());
    return NextResponse.json({ vehicle });
  } catch (error) {
    const message = error instanceof ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Pedido inválido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
