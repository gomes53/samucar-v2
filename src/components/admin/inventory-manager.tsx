"use client";

import Image from "next/image";
import { ArrowUpToLine, EyeOff, LoaderCircle, LogOut, Pencil, Plus, RotateCcw, Star, Trash2, Upload, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Vehicle, VehicleInput, VehicleStatus } from "@/types/vehicle";

const emptyVehicle = (): VehicleInput => ({
  id: crypto.randomUUID(),
  brand: "",
  model: "",
  version: "",
  price: 0,
  year: new Date().getFullYear(),
  month: 1,
  kms: 0,
  fuel: "Diesel",
  horsepower: 0,
  displacement: 0,
  transmission: "Manual",
  equipment: [],
  photos: [],
  active: true,
  status: "available",
  featured: false,
  sortOrder: Date.now(),
});

export function InventoryManager({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [draft, setDraft] = useState<VehicleInput | null>(null);
  const [equipment, setEquipment] = useState("");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const activeVehicles = vehicles.filter((vehicle) => vehicle.active);
  const inactiveVehicles = vehicles.filter((vehicle) => !vehicle.active);
  const sectionVehicles = section === "active" ? activeVehicles : inactiveVehicles;
  const visible = sectionVehicles.filter((vehicle) => `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.toLowerCase().includes(query.toLowerCase()));

  const edit = (vehicle: Vehicle) => {
    setDraft(vehicle);
    setEquipment(vehicle.equipment.join(", "));
    setError("");
  };

  const create = () => {
    setDraft(emptyVehicle());
    setEquipment("");
    setError("");
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length || !draft) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append("photos", file));
      const response = await fetch("/api/admin/images", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível carregar as fotografias.");
      setDraft((current) => current ? { ...current, photos: [...current.photos, ...result.urls] } : current);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erro no carregamento.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...draft, equipment: equipment.split(",").map((item) => item.trim()).filter(Boolean) };
      const response = await fetch("/api/admin/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível guardar a viatura.");
      setVehicles((current) => {
        const index = current.findIndex((vehicle) => vehicle.id === result.vehicle.id);
        if (index < 0) return [result.vehicle, ...current];
        return current.map((vehicle) => vehicle.id === result.vehicle.id ? result.vehicle : vehicle);
      });
      setDraft(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (vehicle: Vehicle, active: boolean) => {
    const action = active ? "reativar" : "desativar";
    if (!active && !confirm(`Desativar ${vehicle.brand} ${vehicle.model}? A viatura deixará de aparecer no site.`)) return;
    setError("");
    const response = await fetch("/api/admin/vehicles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...vehicle, active }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? `Não foi possível ${action} a viatura.`);
      return;
    }
    setVehicles((current) => current.map((item) => item.id === vehicle.id ? result.vehicle : item));
  };

  const promote = async (vehicle: Vehicle) => {
    setPromotingId(vehicle.id);
    setError("");
    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehicle, sortOrder: Date.now() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível trazer a viatura para o topo.");
      setVehicles((current) => current
        .map((item) => item.id === vehicle.id ? result.vehicle : item)
        .sort((a, b) => b.sortOrder - a.sortOrder || b.createdAt.localeCompare(a.createdAt)));
    } catch (promoteError) {
      setError(promoteError instanceof Error ? promoteError.message : "Erro ao atualizar a ordem.");
    } finally {
      setPromotingId(null);
    }
  };

  const removePermanently = async (vehicle: Vehicle) => {
    if (!confirm(`Eliminar definitivamente ${vehicle.brand} ${vehicle.model}?\n\nEsta ação apaga também as fotografias e não pode ser anulada.`)) return;
    setError("");
    const response = await fetch(`/api/admin/vehicles/${encodeURIComponent(vehicle.id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Não foi possível eliminar a viatura.");
      return;
    }
    setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
  };

  const focusNextField = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName === "TEXTAREA") return;

    const fields = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'input:not([type="file"]):not([type="checkbox"]):not([disabled]), select:not([disabled])',
      ),
    );
    const currentIndex = fields.indexOf(target);
    if (currentIndex < 0) return;

    event.preventDefault();
    fields[currentIndex + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#f4f4f2]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="shell flex h-20 items-center justify-between">
          <div><p className="text-xl font-black">Gestão de stock</p><p className="text-xs text-zinc-500">Área reservada Samucar</p></div>
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="flex items-center gap-2 text-sm font-bold text-zinc-600"><LogOut size={17} />Terminar sessão</button>
        </div>
      </header>
      <main className="shell py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-3xl font-black">{activeVehicles.length} viaturas ativas</h1><p className="text-sm text-zinc-500">As viaturas desativadas não aparecem no site e podem ser restauradas.</p></div>
          <button className="gold-button justify-center px-5 py-3" onClick={create}><Plus size={18} />Adicionar viatura</button>
        </div>
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        <div className="mb-6 flex rounded-xl border border-zinc-200 bg-white p-1 sm:w-fit">
          <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold sm:flex-none ${section === "active" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
            onClick={() => setSection("active")}
          >
            Ativas ({activeVehicles.length})
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold sm:flex-none ${section === "inactive" ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
            onClick={() => setSection("inactive")}
          >
            Desativadas ({inactiveVehicles.length})
          </button>
        </div>
        <input className="admin-input mb-6 max-w-lg" placeholder="Pesquisar stock…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500"><tr><th className="p-4">Viatura</th><th className="p-4">Ano / Km</th><th className="p-4">Preço</th><th className="p-4">Estado</th><th className="p-4 text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="p-4"><div className="flex items-center gap-3"><div className="relative h-14 w-20 overflow-hidden rounded-lg bg-zinc-100"><Image src={vehicle.photos[0]} alt="" fill sizes="80px" className="object-cover" /></div><div><p className="font-bold">{vehicle.brand} {vehicle.model}</p><p className="text-xs text-zinc-500">{vehicle.version}</p></div>{vehicle.featured && <Star size={15} className="fill-[#d4a84f] text-[#d4a84f]" />}</div></td>
                  <td className="p-4 text-zinc-600">{vehicle.year}<br /><span className="text-xs">{formatNumber(vehicle.kms)} km</span></td>
                  <td className="p-4 font-bold">{formatPrice(vehicle.price)}</td>
                  <td className="p-4"><Status status={vehicle.status} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50" onClick={() => edit(vehicle)} aria-label="Editar"><Pencil size={17} /></button>
                      {vehicle.active ? (
                        <>
                          <button className="rounded-lg border border-[#d8b45f]/60 p-2 text-[#8d6a27] hover:bg-amber-50 disabled:opacity-50" onClick={() => void promote(vehicle)} aria-label="Trazer para o topo" title="Trazer para o topo" disabled={promotingId !== null}>{promotingId === vehicle.id ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowUpToLine size={17} />}</button>
                          <button className="rounded-lg border border-amber-200 p-2 text-amber-700 hover:bg-amber-50" onClick={() => void setActive(vehicle, false)} aria-label="Desativar" title="Desativar"><EyeOff size={17} /></button>
                        </>
                      ) : (
                        <>
                          <button className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50" onClick={() => void setActive(vehicle, true)} aria-label="Reativar" title="Reativar"><RotateCcw size={17} /></button>
                          <button className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" onClick={() => void removePermanently(vehicle)} aria-label="Eliminar definitivamente" title="Eliminar definitivamente"><Trash2 size={17} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {draft && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/65 sm:p-8">
          <form
            className="mx-auto min-h-dvh max-w-4xl bg-white shadow-2xl sm:min-h-0 sm:rounded-2xl"
            onKeyDown={focusNextField}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-black">{vehicles.some((vehicle) => vehicle.id === draft.id) ? "Editar viatura" : "Nova viatura"}</h2>
              <button type="button" onClick={() => setDraft(null)} aria-label="Fechar"><X /></button>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <Field label="Marca" value={draft.brand} onChange={(value) => setDraft({ ...draft, brand: value })} />
              <Field label="Modelo" value={draft.model} onChange={(value) => setDraft({ ...draft, model: value })} />
              <Field label="Versão" value={draft.version} onChange={(value) => setDraft({ ...draft, version: value })} className="sm:col-span-2" />
              <NumberField label="Preço (€)" value={draft.price} onChange={(value) => setDraft({ ...draft, price: value })} />
              <NumberField label="Quilómetros" value={draft.kms} onChange={(value) => setDraft({ ...draft, kms: value })} />
              <NumberField label="Ano" value={draft.year} onChange={(value) => setDraft({ ...draft, year: value })} />
              <NumberField label="Mês" value={draft.month} onChange={(value) => setDraft({ ...draft, month: value })} />
              <SelectField label="Combustível" value={draft.fuel} options={["Diesel", "Gasolina", "Elétrico", "Híbrido-Diesel", "Híbrido-Gasolina"]} onChange={(value) => setDraft({ ...draft, fuel: value })} />
              <SelectField label="Transmissão" value={draft.transmission} options={["Automático", "Manual"]} onChange={(value) => setDraft({ ...draft, transmission: value })} />
              <NumberField label="Potência (cv)" value={draft.horsepower} onChange={(value) => setDraft({ ...draft, horsepower: value })} />
              <NumberField label="Cilindrada (cc)" value={draft.displacement} onChange={(value) => setDraft({ ...draft, displacement: value })} />
              <label className="admin-label sm:col-span-2">Equipamento (separado por vírgulas)<textarea className="admin-input min-h-24 resize-y" value={equipment} onChange={(event) => setEquipment(event.target.value)} /></label>
              <SelectField label="Estado" value={draft.status} options={["available", "reserved", "sold"]} labels={["Disponível", "Reservado", "Vendido"]} onChange={(value) => setDraft({ ...draft, status: value as VehicleStatus })} />
              <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-200 p-3">
                <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} />
                <span><span className="block text-sm font-bold">Mostrar selo “Destaque”</span><span className="mt-0.5 block text-xs font-normal text-zinc-500">Adiciona um selo dourado à viatura no catálogo.</span></span>
              </label>
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-bold text-zinc-600">Fotografias</p>
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {draft.photos.map((photo, index) => <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100"><Image src={photo} alt="" fill sizes="160px" className="object-cover" />{index === 0 ? <span className="absolute bottom-1 left-1 rounded bg-[#d8b45f] px-2 py-1 text-[10px] font-black text-black">CAPA</span> : <button type="button" className="absolute bottom-1 left-1 rounded bg-black/75 px-2 py-1 text-[10px] font-bold text-white" onClick={() => setDraft({ ...draft, photos: [photo, ...draft.photos.filter((_, photoIndex) => photoIndex !== index)] })}>Usar como capa</button>}<button type="button" className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white" onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, photoIndex) => photoIndex !== index) })}><X size={14} /></button></div>)}
                </div>
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-sm font-bold text-zinc-600 hover:border-[#c19742]">
                  {uploading ? <LoaderCircle className="mb-2 animate-spin" /> : <Upload className="mb-2" />}
                  {uploading ? "A carregar…" : "Selecionar fotografias (a primeira será a capa)"}
                  <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => uploadPhotos(event.target.files)} disabled={uploading} />
                </label>
              </div>
              {error && <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white p-5 sm:px-8 sm:pb-8">
              <button type="button" className="rounded-lg px-4 py-3 text-sm font-bold sm:px-5" onClick={() => setDraft(null)}>Cancelar</button>
              <button type="submit" className="gold-button justify-center px-5 py-3 disabled:opacity-50 sm:px-6" disabled={saving || uploading}>{saving && <LoaderCircle className="animate-spin" size={17} />}{saving ? "A guardar…" : "Guardar viatura"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Status({ status }: { status: VehicleStatus }) {
  const style = status === "available" ? "bg-emerald-50 text-emerald-700" : status === "reserved" ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-600";
  const label = status === "available" ? "Disponível" : status === "reserved" ? "Reservado" : "Vendido";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{label}</span>;
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`admin-label ${className}`}>{label}<input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} enterKeyHint="next" required /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  return <label className="admin-label">{label}<input className="admin-input" type="number" min="0" inputMode="numeric" enterKeyHint="next" value={text} onChange={(event) => { setText(event.target.value); onChange(event.target.value === "" ? 0 : Number(event.target.value)); }} required /></label>;
}

function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: string[]; onChange: (value: string) => void }) {
  return <label className="admin-label">{label}<select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></label>;
}
