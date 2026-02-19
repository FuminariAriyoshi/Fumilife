"use client";

import gsap from "gsap";

const OVERLAY_ID = "transition-overlay";

/**
 * barba.js 互換の transition（Next.js App Router 用）
 * leave/enter でオーバーレイを制御し、実際の遷移は router.push で行う
 */
function overlayLeave() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return Promise.resolve();
  overlay.style.visibility = "visible";
  return new Promise((resolve) => {
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: resolve,
    });
  });
}

function overlayEnter() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        overlay.style.visibility = "hidden";
        resolve();
      },
    });
  });
}

const defaultTransition = {
  name: "default",
  leave: overlayLeave,
  enter: overlayEnter,
};

/**
 * ページ離脱（leave）を実行する。遷移リンク用。
 * @returns {Promise<void>}
 */
export function runLeave() {
  return defaultTransition.leave();
}

/**
 * ページ進入（enter）を実行する。pathname 変更後に呼ぶ。
 * @returns {Promise<void>}
 */
export function runEnter() {
  return defaultTransition.enter();
}

/**
 * ロード画面用 leave（barba の once 相当）。コンテナを上にスライドさせてから完了コールバック。
 * @param {HTMLElement} container
 * @param {object} [options] duration, ease
 * @returns {Promise<void>}
 */
export function runLoadPageLeave(container, options = {}) {
  if (!container) return Promise.resolve();
  const { duration = 1.2, ease = "power4.inOut" } = options;
  return new Promise((resolve) => {
    gsap.to(container, {
      y: "-100%",
      duration,
      ease,
      onComplete: resolve,
    });
  });
}

export { defaultTransition };
