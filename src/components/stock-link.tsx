"use client";

import type { ReactNode } from "react";

export function StockLink({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
}) {
  const scrollToStock = () => {
    const stock = document.getElementById("stock");
    if (!stock) return;

    stock.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#stock");
  };

  return (
    <a href="#stock" className={className} aria-label={ariaLabel} onClick={(event) => {
      event.preventDefault();
      scrollToStock();
    }}>
      {children}
    </a>
  );
}
