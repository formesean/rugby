"use client";

import { OverlayScrollbars } from "overlayscrollbars";
import { useEffect } from "react";
import "overlayscrollbars/overlayscrollbars.css";
import { QueryProvider } from "./query-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const instance = OverlayScrollbars(document.body, {
      scrollbars: {
        theme: "os-theme-dark",
        autoHide: "scroll",
        autoHideDelay: 800,
      },
      overflow: {
        x: "hidden",
      },
    });
    document.documentElement.style.scrollBehavior = "smooth";
    return () => instance.destroy();
  }, []);

  return <QueryProvider>{children}</QueryProvider>;
}
