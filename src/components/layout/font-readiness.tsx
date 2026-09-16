"use client";

import { useEffect } from "react";

export function FontReadiness() {
  useEffect(() => {
    let active = true;

    void Promise.allSettled([
      document.fonts.load("40px surahnames"),
      document.fonts.load("43px IndoPak"),
      document.fonts.load("20px MehrNastaliq"),
    ]).finally(() => {
      if (active) document.documentElement.dataset.surahNamesFontReady = "true";
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
