"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/vehicle-card";
import { trackEvent } from "@/lib/analytics";
import type { Vehicle } from "@/types/vehicle";

type Sort = "recent" | "price-asc" | "price-desc" | "year";
const pageSize = 20;

export function Inventory({ vehicles, fixedBrand = "" }: { vehicles: Vehicle[]; fixedBrand?: string }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(fixedBrand);
  const [model, setModel] = useState("");
  const [fuel, setFuel] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const stockVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.active && vehicle.status !== "sold"),
    [vehicles],
  );
  const brands = useMemo(() => [...new Set(stockVehicles.map((vehicle) => vehicle.brand))].sort(), [stockVehicles]);
  const fuels = useMemo(() => [...new Set(stockVehicles.map((vehicle) => vehicle.fuel))].sort(), [stockVehicles]);
  const models = useMemo(() => {
    if (!brand) return [];
    const counts = new Map<string, number>();
    stockVehicles
      .filter((vehicle) => vehicle.brand === brand)
      .forEach((vehicle) => counts.set(vehicle.model, (counts.get(vehicle.model) ?? 0) + 1));
    return [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right, "pt"))
      .map(([value, count]) => ({ value, label: `${value} (${count})` }));
  }, [brand, stockVehicles]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt");
    return vehicles
      .filter((vehicle) => vehicle.active)
      .filter((vehicle) => vehicle.status !== "sold")
      .filter((vehicle) => !brand || vehicle.brand === brand)
      .filter((vehicle) => !model || vehicle.model === model)
      .filter((vehicle) => !fuel || vehicle.fuel === fuel)
      .filter(
        (vehicle) =>
          !normalized ||
          `${vehicle.brand} ${vehicle.model} ${vehicle.version}`
            .toLocaleLowerCase("pt")
            .includes(normalized),
      )
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "year") return b.year - a.year;
        return b.sortOrder - a.sortOrder || b.createdAt.localeCompare(a.createdAt);
      });
  }, [vehicles, query, brand, model, fuel, sort]);

  const hasFilters = Boolean(query || model || fuel || (!fixedBrand && brand));
  const reset = () => {
    setQuery("");
    setBrand(fixedBrand);
    setModel("");
    setFuel("");
    setVisibleCount(pageSize);
  };
  const updateFilter = (setter: (value: string) => void, value: string, eventName?: string) => {
    setter(value);
    setVisibleCount(pageSize);
    if (value && eventName) trackEvent(eventName, { value });
  };
  const visibleVehicles = filtered.slice(0, visibleCount);

  return (
    <div>
      <form
        className="mb-8 rounded-2xl border border-black/8 bg-white p-4 shadow-sm lg:flex lg:items-center lg:gap-3"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          event.currentTarget.querySelector("input")?.blur();
          if (query.trim()) trackEvent("search_vehicle", { search_term: query.trim() });
        }}
      >
        <label className="relative mb-3 block flex-1 lg:mb-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={19} />
          <span className="sr-only">Pesquisar viatura</span>
          <input
            type="search"
            enterKeyHint="search"
            className="filter-input search-input w-full"
            placeholder="Marca, modelo ou versão…"
            value={query}
            onChange={(event) => updateFilter(setQuery, event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              event.currentTarget.blur();
            }}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 lg:flex">
          {!fixedBrand && <FilterSelect label="Marca" value={brand} onChange={(value) => { setBrand(value); setModel(""); setVisibleCount(pageSize); if (value) trackEvent("filter_brand", { brand: value }); }} options={brands} />}
          <ModelFilterSelect value={model} onChange={(value) => updateFilter(setModel, value, "filter_model")} options={models} disabled={!brand} />
          <FilterSelect label="Combustível" value={fuel} onChange={(value) => updateFilter(setFuel, value, "filter_fuel")} options={fuels} />
          <label>
            <span className="sr-only">Ordenar</span>
            <select className="filter-input w-full" value={sort} onChange={(event) => { setSort(event.target.value as Sort); setVisibleCount(pageSize); }}>
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Preço mais baixo</option>
              <option value="price-desc">Preço mais alto</option>
              <option value="year">Ano mais recente</option>
            </select>
          </label>
        </div>
      </form>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500"><strong className="text-zinc-900">{filtered.length}</strong> viaturas encontradas</p>
        {hasFilters && <button className="flex items-center gap-1 text-sm font-semibold text-[#8d6a27]" onClick={reset}><X size={16} />Limpar filtros</button>}
      </div>
      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
          <SlidersHorizontal className="mx-auto mb-4 text-zinc-400" />
          <h2 className="text-xl font-bold">Sem resultados</h2>
          <p className="mt-2 text-zinc-500">Experimente alterar ou limpar os filtros.</p>
        </div>
      )}
      {visibleCount < filtered.length && (
        <div className="mt-10 text-center">
          <button
            className="rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-sm font-black text-zinc-800 shadow-sm transition hover:border-[#b88932] hover:text-[#8d6a27]"
            onClick={() => {
              setVisibleCount((count) => count + pageSize);
              trackEvent("load_more_vehicles", { visible_before: visibleCount, total_results: filtered.length });
            }}
          >
            Carregar mais viaturas
          </button>
          <p className="mt-3 text-xs text-zinc-400">
            A mostrar {visibleVehicles.length} de {filtered.length}
          </p>
        </div>
      )}
    </div>
  );
}

function ModelFilterSelect({ value, onChange, options, disabled }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; disabled: boolean }) {
  return (
    <label>
      <span className="sr-only">Modelo</span>
      <select className="filter-input w-full disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 lg:w-40" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        <option value="">{disabled ? "Escolha uma marca" : "Modelo"}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="filter-input w-full lg:w-40" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
