"use client";

import { useEffect } from "react";

export function FontReadiness() {
  useEffect(() => {
    let active = true;

    void Promise.allSettled([
      document.fonts.load('40px "surahnames"', "001"),
      document.fonts.load("43px IndoPak"),
      document.fonts.load("20px MehrNastaliq"),
    ]).then(([surahNamesResult]) => {
      const surahNamesLoaded = surahNamesResult?.status === "fulfilled" && surahNamesResult.value.length > 0;
      if (active && surahNamesLoaded) document.documentElement.dataset.surahNamesFontReady = "true";
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
