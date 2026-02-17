"use client";

import GrdLstTransitionLink from "./GrdLstTransitionLink";
import { usePathname } from "next/navigation";

/**
 * GRID / LIST 切り替え。標準は GRID（/）。現在のパスでアクティブを表示。
 */
export default function GrdLstContainer() {
  const pathname = usePathname();
  const isGrid = pathname === "/"; // 標準は GRID（トップ）

  return (
    <div className="GrdLst-container">
      <GrdLstTransitionLink
        href="/"
        className={`btn ${isGrid ? "btn--active" : ""}`}
      >
        GRID
      </GrdLstTransitionLink>
      <GrdLstTransitionLink
        href="/list"
        className={`btn ${pathname === "/list" ? "btn--active" : ""}`}
      >
        LIST
      </GrdLstTransitionLink>
    </div>
  );
}
