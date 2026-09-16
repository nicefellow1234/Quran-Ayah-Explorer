import "server-only";

import { createServerClient } from "@quranjs/api/server";

import { QuranApiError } from "./errors";

const clientId = process.env.QF_CLIENT_ID;
const clientSecret = process.env.QF_CLIENT_SECRET;

export const isQuranConfigured = Boolean(clientId && clientSecret);

export function getQuranClient() {
  if (!clientId || !clientSecret) {
    throw new QuranApiError(
      "Quran Foundation credentials are not configured.",
      "client",
    );
  }

  return createServerClient({
    clientId,
    clientSecret,
    services: {
      gatewayUrl:
        process.env.QF_GATEWAY_URL ?? "https://apis-prelive.quran.foundation",
      oauth2BaseUrl:
        process.env.QF_OAUTH2_URL ?? "https://prelive-oauth2.quran.foundation",
    },
  });
}

export function logQuranError(operation: string, error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown error";
  console.error(`[quran:${operation}] ${detail}`);
}
