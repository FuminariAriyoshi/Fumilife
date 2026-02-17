"use client";

import { useState, useEffect } from "react";

/**
 * LIGHT / DARK ボタン。LIGHT=白背景、DARK=現在の暗い背景。
 * テーマに応じたボタンの色はこのコンポーネント内で管理。
 */
const lightThemeBtnStyle = {
  color: "#111",
  mixBlendMode: "normal",
  opacity: 0.7,
};
const lightThemeBtnActiveStyle = { ...lightThemeBtnStyle, opacity: 1 };

export default function BtnContainer() {
  const [theme, setTheme] = useState("LIGHT");
  const isLight = theme === "LIGHT";

  useEffect(() => {
    document.body.setAttribute("data-theme", isLight ? "light" : "dark");
  }, [theme, isLight]);

  return (
    <div className="btn-container" data-theme={isLight ? "light" : "dark"}>
      <button
        type="button"
        className={`btn ${theme === "LIGHT" ? "btn--active" : ""}`}
        onClick={() => setTheme("LIGHT")}
        aria-pressed={theme === "LIGHT"}
        style={isLight ? (theme === "LIGHT" ? lightThemeBtnActiveStyle : lightThemeBtnStyle) : undefined}
      >
        LIGHT
      </button>
      <button
        type="button"
        className={`btn ${theme === "DARK" ? "btn--active" : ""}`}
        onClick={() => setTheme("DARK")}
        aria-pressed={theme === "DARK"}
        style={isLight ? (theme === "DARK" ? lightThemeBtnActiveStyle : lightThemeBtnStyle) : undefined}
      >
        DARK
      </button>
    </div>
  );
}
