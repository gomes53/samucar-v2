"use client";

import Image from "next/image";
import { LoaderCircle, LogOut, Pencil, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const visible = vehicles.filter((vehicle) => `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.toLowerCase().includes(query.toLowerCase()));

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

  const remove = async (vehicle: Vehicle) => {
    if (!confirm(`Eliminar definitivamente ${vehicle.brand} ${vehicle.model}?`)) return;
    setError("");
    const response = await fetch(`/api/admin/vehicles/${encodeURIComponent(vehicle.id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Não foi possível eliminar a viatura.");
      return;
    }
    setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
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
          <div><h1 className="text-3xl font-black">{vehicles.length} viaturas</h1><p className="text-sm text-zinc-500">Adicione, edite e remova o stock publicado.</p></div>
          <button className="gold-button justify-center px-5 py-3" onClick={create}><Plus size={18} />Adicionar viatura</button>
        </div>
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
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
                  <td className="p-4"><div className="flex justify-end gap-2"><button className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50" onClick={() => edit(vehicle)} aria-label="Editar"><Pencil size={17} /></button><button className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" onClick={() => remove(vehicle)} aria-label="Eliminar"><Trash2 size={17} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {draft && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/65 p-3 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-black">{vehicles.some((vehicle) => vehicle.id === draft.id) ? "Editar viatura" : "Nova viatura"}</h2>
              <button onClick={() => setDraft(null)} aria-label="Fechar"><X /></button>
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
              <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-200 p-3 text-sm font-bold"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} />Destacar na página inicial</label>
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-bold text-zinc-600">Fotografias</p>
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {draft.photos.map((photo, index) => <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100"><Image src={photo} alt="" fill sizes="160px" className="object-cover" />{index === 0 ? <span className="absolute bottom-1 left-1 rounded bg-[#d8b45f] px-2 py-1 text-[10px] font-black text-black">CAPA</span> : <button className="absolute bottom-1 left-1 rounded bg-black/75 px-2 py-1 text-[10px] font-bold text-white" onClick={() => setDraft({ ...draft, photos: [photo, ...draft.photos.filter((_, photoIndex) => photoIndex !== index)] })}>Usar como capa</button>}<button className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white" onClick={() => setDraft({ ...draft, photos: draft.photos.filter((_, photoIndex) => photoIndex !== index) })}><X size={14} /></button></div>)}
                </div>
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-sm font-bold text-zinc-600 hover:border-[#c19742]">
                  {uploading ? <LoaderCircle className="mb-2 animate-spin" /> : <Upload className="mb-2" />}
                  {uploading ? "A carregar…" : "Selecionar fotografias (a primeira será a capa)"}
                  <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => uploadPhotos(event.target.files)} disabled={uploading} />
                </label>
              </div>
              {error && <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-200 bg-white p-5">
              <button className="rounded-lg px-5 py-3 text-sm font-bold" onClick={() => setDraft(null)}>Cancelar</button>
              <button className="gold-button px-6 py-3 disabled:opacity-50" onClick={save} disabled={saving || uploading}>{saving && <LoaderCircle className="animate-spin" size={17} />}{saving ? "A guardar…" : "Guardar viatura"}</button>
            </div>
          </div>
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
  return <label className={`admin-label ${className}`}>{label}<input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="admin-label">{label}<input className="admin-input" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} required /></label>;
}

function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: string[]; onChange: (value: string) => void }) {
  return <label className="admin-label">{label}<select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select></label>;
}
