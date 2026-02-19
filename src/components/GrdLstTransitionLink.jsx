"use client";

import { usePathname, useRouter } from "next/navigation";
import { runLeave } from "@/lib/barbaTransition";

/**
 * barba.js 風の leave → 遷移。leave 完了後に router.push する。
 */
export function animatePageOut(href, router) {
  runLeave().then(() => router.push(href));
}

export default function GrdLstTransitionLink({ href, children, ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && href !== pathname) {
      e.preventDefault();
      animatePageOut(href, router);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
