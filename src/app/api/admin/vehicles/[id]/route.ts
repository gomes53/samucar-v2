import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteVehicleImage } from "@/lib/images";
import { deleteVehicle, listVehicles } from "@/lib/vehicles";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const id = (await params).id;
    const vehicle = (await listVehicles()).find((item) => item.id === id);
    if (!vehicle) return NextResponse.json({ error: "Viatura não encontrada." }, { status: 404 });
    for (const photo of vehicle.photos) await deleteVehicleImage(photo);
    await deleteVehicle(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao eliminar." }, { status: 500 });
  }
}
