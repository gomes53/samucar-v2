"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventParameters?: Record<string, string | number | boolean>;
};

export function TrackedAnchor({
  eventName,
  eventParameters,
  onClick,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParameters);
        onClick?.(event);
      }}
    />
  );
}
