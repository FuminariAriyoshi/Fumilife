"use client";

import { useState, createContext } from "react";
import LoadPage from "./LoadPage";

/** LoadPage が終了したかどうか（ListPage の初期アニメなどで参照） */
export const LoadContext = createContext(false);

/**
 * LoadPageをラップして、ロード状態を管理
 */
export default function LoadPageWrapper({ children, images = [] }) {
  // ロード画面を無効化するため、初期状態を true に設定
  const [isLoaded, setIsLoaded] = useState(true);

  return (
    <LoadContext.Provider value={isLoaded}>
      {children}
      {/* {!isLoaded && (
        <LoadPage 
          images={images}
          onComplete={() => setIsLoaded(true)} 
        />
      )} */}
    </LoadContext.Provider>
  );
}
