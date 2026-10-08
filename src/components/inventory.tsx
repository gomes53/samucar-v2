"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/vehicle-card";
import type { Vehicle } from "@/types/vehicle";

type Sort = "recent" | "price-asc" | "price-desc" | "year";
const pageSize = 20;

export function Inventory({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort();
  const fuels = [...new Set(vehicles.map((vehicle) => vehicle.fuel))].sort();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt");
    return vehicles
      .filter((vehicle) => vehicle.status !== "sold")
      .filter((vehicle) => !brand || vehicle.brand === brand)
      .filter((vehicle) => !fuel || vehicle.fuel === fuel)
      .filter((vehicle) => !transmission || vehicle.transmission === transmission)
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
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [vehicles, query, brand, fuel, transmission, sort]);

  const hasFilters = Boolean(query || brand || fuel || transmission);
  const reset = () => {
    setQuery("");
    setBrand("");
    setFuel("");
    setTransmission("");
    setVisibleCount(pageSize);
  };
  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setVisibleCount(pageSize);
  };
  const visibleVehicles = filtered.slice(0, visibleCount);

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-black/8 bg-white p-4 shadow-sm lg:flex lg:items-center lg:gap-3">
        <label className="relative mb-3 block flex-1 lg:mb-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={19} />
          <span className="sr-only">Pesquisar viatura</span>
          <input className="filter-input w-full pl-11" placeholder="Marca, modelo ou versão…" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <FilterSelect label="Marca" value={brand} onChange={(value) => updateFilter(setBrand, value)} options={brands} />
          <FilterSelect label="Combustível" value={fuel} onChange={(value) => updateFilter(setFuel, value)} options={fuels} />
          <FilterSelect label="Transmissão" value={transmission} onChange={(value) => updateFilter(setTransmission, value)} options={["Automático", "Manual"]} />
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
      </div>
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
            onClick={() => setVisibleCount((count) => count + pageSize)}
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
