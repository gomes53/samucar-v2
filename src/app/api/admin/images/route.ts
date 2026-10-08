import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadVehicleImage } from "@/lib/images";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const form = await request.formData();
    const files = form.getAll("photos").filter((item): item is File => item instanceof File);
    if (!files.length) return NextResponse.json({ error: "Selecione pelo menos uma fotografia." }, { status: 400 });
    if (files.length > 30) return NextResponse.json({ error: "Pode carregar no máximo 30 fotografias de cada vez." }, { status: 400 });
    const urls = [];
    for (const file of files) urls.push(await uploadVehicleImage(file));
    return NextResponse.json({ urls });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao carregar fotografias." }, { status: 400 });
  }
}
