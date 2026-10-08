"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const result = await response.json();
        setLoading(false);
        if (!response.ok) {
          setError(result.error ?? "Não foi possível iniciar sessão.");
          return;
        }
        router.refresh();
      }}
    >
      <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#f1e7ce] text-[#8d6a27]"><LockKeyhole /></span>
      <h1 className="text-2xl font-black">Área reservada</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-500">Introduza a palavra-passe de administração para gerir o stock.</p>
      <label className="admin-label mt-7 text-left">Palavra-passe<input className="admin-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /></label>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="gold-button mt-5 w-full justify-center px-6 py-4 disabled:opacity-50" disabled={loading}>
        {loading && <LoaderCircle className="animate-spin" size={18} />}
        {loading ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
