"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const previous = () => setSelected((value) => (value - 1 + photos.length) % photos.length);
  const next = () => setSelected((value) => (value + 1) % photos.length);
  const finishSwipe = (endX: number) => {
    if (touchStartX.current === null) return;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 50) return;
    if (distance < 0) next();
    else previous();
  };

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <button
            className="relative block aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-2xl bg-zinc-100"
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false;
                return;
              }
              setOpen(true);
            }}
            onTouchStart={(event) => {
              didSwipe.current = false;
              touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const startX = touchStartX.current;
              const endX = event.changedTouches[0]?.clientX;
              if (startX !== null && endX !== undefined && Math.abs(endX - startX) >= 50) {
                didSwipe.current = true;
                event.preventDefault();
                finishSwipe(endX);
              }
            }}
          >
            <Image src={photos[selected]} alt={`${title} — fotografia ${selected + 1}`} fill priority sizes="(max-width: 768px) 100vw, 70vw" className="pointer-events-none select-none object-cover" draggable={false} />
            <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">{selected + 1} / {photos.length}</span>
          </button>
          {photos.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg transition hover:bg-black md:grid" onClick={previous} aria-label="Fotografia anterior"><ChevronLeft size={28} /></button>
              <button className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg transition hover:bg-black md:grid" onClick={next} aria-label="Fotografia seguinte"><ChevronRight size={28} /></button>
            </>
          )}
        </div>
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 md:max-h-[560px] md:flex-col md:gap-3 md:overflow-y-auto md:pb-0">
          {photos.map((photo, index) => (
            <button key={photo} className={`relative aspect-[4/3] min-w-24 snap-start overflow-hidden rounded-lg border-2 min-[390px]:min-w-28 md:min-h-28 md:min-w-0 md:rounded-xl ${selected === index ? "border-[#c69b42]" : "border-transparent"}`} onClick={() => setSelected(index)}>
              <Image src={photo} alt="" fill sizes="180px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/95 p-4">
          <button className="absolute right-5 top-5 text-white" onClick={() => setOpen(false)} aria-label="Fechar galeria"><X size={32} /></button>
          <button className="absolute left-3 text-white sm:left-8" onClick={previous} aria-label="Fotografia anterior"><ChevronLeft size={42} /></button>
          <div className="relative h-[80vh] w-[85vw]">
            <Image src={photos[selected]} alt={`${title} — fotografia ${selected + 1}`} fill sizes="90vw" className="object-contain" />
          </div>
          <button className="absolute right-3 text-white sm:right-8" onClick={next} aria-label="Fotografia seguinte"><ChevronRight size={42} /></button>
        </div>
      )}
    </>
  );
}
