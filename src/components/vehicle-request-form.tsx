"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type RequestType = "sell" | "order";

export function VehicleRequestForm({ type }: { type: RequestType }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isSell = type === "sell";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/vehicle-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível enviar o pedido. Tente novamente.");
        return;
      }

      trackEvent("generate_lead", { lead_type: type });
      router.push("/pedido-recebido");
    } catch {
      setError("Não foi possível ligar ao servidor. Verifique a ligação e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="rounded-3xl border border-black/8 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,.08)] sm:p-8 lg:p-10" onSubmit={submit}>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-950">Os seus dados</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Utilizaremos estes contactos apenas para responder ao seu pedido.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <RequestField label="Nome" name="name" autoComplete="name" placeholder="O seu nome" />
        <RequestField label="Email" name="email" type="email" autoComplete="email" placeholder="nome@exemplo.pt" />
        <RequestField label="Telemóvel" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="910 000 000" />
      </div>

      <div className="my-9 border-t border-zinc-200 pt-8">
        <h2 className="text-2xl font-black text-zinc-950">
          {isSell ? "A sua viatura" : "A viatura que procura"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {isSell
            ? "Indique as características principais para prepararmos uma avaliação."
            : "Diga-nos o que procura e entraremos em contacto com opções adequadas."}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <RequestField label="Marca" name="brand" autoComplete="off" placeholder="Ex.: BMW" />
        <RequestField label="Modelo" name="model" autoComplete="off" placeholder="Ex.: Série 3" />
        <RequestField label="Ano" name="year" type="number" inputMode="numeric" min="1900" max={new Date().getFullYear() + 1} placeholder="Ex.: 2020" />
        <RequestField label="Cor" name="color" autoComplete="off" placeholder="Ex.: Preto" />
        {isSell ? (
          <>
            <RequestField label="Quilómetros" name="kms" type="number" inputMode="numeric" min="0" placeholder="Ex.: 85000" />
            <RequestField label="Valor pretendido (opcional)" name="desiredPrice" type="number" inputMode="numeric" min="0" required={false} placeholder="Ex.: 20000 €" />
          </>
        ) : (
          <>
            <RequestField label="Quilómetros máximos" name="maxKms" type="number" inputMode="numeric" min="0" placeholder="Ex.: 100000" />
            <RequestField label="Orçamento máximo" name="maxBudget" type="number" inputMode="numeric" min="1" placeholder="Ex.: 30000 €" />
          </>
        )}
        <label className="sm:col-span-2">
          <span className="request-label">Descrição adicional (opcional)</span>
          <textarea
            className="request-input min-h-36 resize-y py-3"
            name="description"
            maxLength={2000}
            placeholder={isSell ? "Estado geral, histórico, equipamento ou outras informações relevantes…" : "Versão, combustível, transmissão, equipamento ou outras preferências…"}
          />
        </label>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      <p className="mt-7 text-xs leading-5 text-zinc-500">
        Ao enviar, declara que leu a nossa{" "}
        <Link className="font-bold text-[#8d6a27] underline" href="/privacidade">Política de Privacidade</Link>.
        Os dados serão utilizados exclusivamente para analisar e responder ao seu pedido.
      </p>
      <button
        className="gold-button mt-6 w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
        type="submit"
        disabled={submitting}
      >
        {submitting ? <><LoaderCircle className="animate-spin" size={19} />A enviar…</> : <>Enviar pedido<ArrowRight size={19} /></>}
      </button>
    </form>
  );
}

type RequestFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "number";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  placeholder?: string;
  min?: string;
  max?: number;
  required?: boolean;
};

function RequestField({
  label,
  name,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  min,
  max,
  required = true,
}: RequestFieldProps) {
  return (
    <label>
      <span className="request-label">{label}</span>
      <input
        className="request-input"
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
      />
    </label>
  );
}
