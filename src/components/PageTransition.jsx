"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { runEnter } from "@/lib/barbaTransition";

/**
 * barba.js 風の enter 用オーバーレイ。pathname 変更時に enter を実行。
 */
export default function PageTransition() {
  const overlayRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    runEnter();
  }, [pathname]);

  return (
    <div
      id="transition-overlay"
      ref={overlayRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
      }}
    />
  );
}

// Helper to check standard anchor clicks manually if needed, or use custom link
// Custom link is preferred.
