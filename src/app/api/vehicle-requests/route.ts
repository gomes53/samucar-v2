import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ZodError } from "zod";
import { buildVehicleRequestEmail, vehicleRequestSchema } from "@/lib/vehicle-requests";

export const runtime = "nodejs";

const defaultRecipients = ["automoveisamucar@gmail.com"];

export async function POST(request: Request) {
  try {
    const vehicleRequest = vehicleRequestSchema.parse(await request.json());
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "O envio de pedidos ainda não está configurado." },
        { status: 503 },
      );
    }

    const recipients = (process.env.LEAD_EMAIL_RECIPIENTS ?? defaultRecipients.join(","))
      .split(",")
      .map((recipient) => recipient.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "Os destinatários dos pedidos não estão configurados." },
        { status: 503 },
      );
    }

    const email = buildVehicleRequestEmail(vehicleRequest);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.LEAD_EMAIL_FROM ?? "Samucar <pedidos@send.samucar.pt>",
      to: recipients,
      replyTo: vehicleRequest.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error) {
      console.error("Resend rejected a Samucar vehicle request.", error);
      return NextResponse.json(
        { error: "Não foi possível enviar o pedido. Tente novamente mais tarde." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Verifique os dados introduzidos.", field: issue?.path[0] },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "O pedido enviado é inválido." }, { status: 400 });
    }
    console.error("Failed to process a Samucar vehicle request.", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o pedido. Tente novamente mais tarde." },
      { status: 500 },
    );
  }
}
