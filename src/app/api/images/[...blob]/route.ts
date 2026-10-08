import { NextResponse } from "next/server";
import { downloadVehicleImage } from "@/lib/images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ blob: string[] }> },
) {
  try {
    const segments = (await params).blob;
    if (!segments.length || segments.some((segment) => segment === "..")) {
      return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
    }

    const image = await downloadVehicleImage(segments.join("/"));
    return new NextResponse(new Uint8Array(image.contents), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": image.cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status =
      error instanceof Error &&
      "statusCode" in error &&
      error.statusCode === 404
        ? 404
        : 500;
    return NextResponse.json(
      { error: status === 404 ? "Imagem não encontrada." : "Erro ao carregar a imagem." },
      { status },
    );
  }
}
