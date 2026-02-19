"use client";

import { useState } from "react";
import LoadPage from "./LoadPage";

/**
 * LoadPageをラップして、ロード状態を管理
 */
export default function LoadPageWrapper({ children, images = [] }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {children}
      {!isLoaded && <LoadPage images={images} onComplete={() => setIsLoaded(true)} />}
    </>
  );
}
