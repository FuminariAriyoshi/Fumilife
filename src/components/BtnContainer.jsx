"use client";

import { useState, useEffect } from "react";

/**
 * LIGHT / DARK ボタン。
 * デフォルトはLIGHT（白背景 #eeeeee、黒テキスト #111）。
 * DARK=暗い背景（#0e0e0e、白テキスト #eeeeee）。
 * テーマに応じたボタンのスタイルはCSSで管理。
 */
export default function BtnContainer() {
  const [theme, setTheme] = useState("LIGHT");
  const isLight = theme === "LIGHT";

  useEffect(() => {
    // デフォルトはLIGHTなので、LIGHTの時はdata-theme属性を削除
    // DARKの時のみdata-theme="dark"を設定
    if (isLight) {
      document.body.removeAttribute("data-theme");
    } else {
      document.body.setAttribute("data-theme", "dark");
    }
  }, [theme, isLight]);

  return (
    <div className="btn-container">
      <button
        type="button"
        className={`btn ${theme === "LIGHT" ? "btn--active" : ""}`}
        onClick={() => setTheme("LIGHT")}
        aria-pressed={theme === "LIGHT"}
      >
        LIGHT
      </button>
      <button
        type="button"
        className={`btn ${theme === "DARK" ? "btn--active" : ""}`}
        onClick={() => setTheme("DARK")}
        aria-pressed={theme === "DARK"}
      >
        DARK
      </button>
    </div>
  );
}
