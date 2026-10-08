import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Fuel, Gauge, GitBranch } from "lucide-react";
import { formatNumber, formatPrice, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_12px_45px_rgba(0,0,0,.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,.12)]">
      <Link href={`/viaturas/${vehicle.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-zinc-100">
        <Image
          src={vehicle.photos[0]}
          alt={vehicleTitle(vehicle)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {vehicle.status !== "available" && (
          <span className="absolute left-4 top-4 rounded-full bg-black/85 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            {vehicle.status === "reserved" ? "Reservado" : "Vendido"}
          </span>
        )}
      </Link>
      <div className="p-4 sm:p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-[#9a762d]">{vehicle.brand}</p>
        <Link href={`/viaturas/${vehicle.slug}`}>
          <h2 className="truncate text-xl font-bold text-zinc-900">{vehicle.model} <span className="font-normal text-zinc-500">{vehicle.version}</span></h2>
        </Link>
        <div className="my-4 grid grid-cols-2 gap-3 border-y border-zinc-100 py-4 text-xs text-zinc-600 min-[390px]:text-sm sm:my-5">
          <span className="spec"><CalendarDays />{vehicle.year}</span>
          <span className="spec"><Gauge />{formatNumber(vehicle.kms)} km</span>
          <span className="spec"><Fuel />{vehicle.fuel}</span>
          <span className="spec"><GitBranch />{vehicle.transmission}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-400">Preço</p>
            <p className="text-xl font-black text-zinc-950 min-[390px]:text-2xl">{formatPrice(vehicle.price)}</p>
          </div>
          <Link className="text-sm font-bold text-[#9a762d] transition group-hover:text-black" href={`/viaturas/${vehicle.slug}`}>
            Ver detalhes →
          </Link>
        </div>
      </div>
    </article>
  );
}
