"use client";

import Script from "next/script";
import { useEffect } from "react";

import { AUTH_TOKEN_KEY } from "@/lib/token";
import { useAuthStore } from "@/store/authStore";

const XEELA_PUBLIC_TOKEN =
  "GJpbb6EXredmAPaiGrzmGHQba6YxDsb0hLZX2UlpE20U5thhGsJYehWJ56wJzUdd";

function upsertMeta(name: string, content: string | null | undefined) {
  const selector = `meta[name="${name}"]`;
  const existing = document.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

export function XeelaChatbot() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const currentToken =
      token ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem(AUTH_TOKEN_KEY)
        : null);

    upsertMeta("user-token", currentToken);
    upsertMeta("user-id", user?.id);
    upsertMeta("user-name", user?.name);
    upsertMeta("user-email", user?.email);
    upsertMeta("user-role", null);
  }, [token, user]);

  return (
    <>
      <Script
        id="xeela-embed-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.EMBED_CONFIG = {
              publicToken: "${XEELA_PUBLIC_TOKEN}",
              getUserToken: function() {
                return document.querySelector("meta[name=user-token]")?.content || null;
              },
              getUserId: function() {
                return document.querySelector("meta[name=user-id]")?.content || null;
              },
              getUserName: function() {
                return document.querySelector("meta[name=user-name]")?.content || null;
              },
              getUserEmail: function() {
                return document.querySelector("meta[name=user-email]")?.content || null;
              },
              getUserRole: function() {
                return null;
              }
            };
          `,
        }}
      />
      <Script
        id="xeela-widget"
        src={`https://xeelaa.com/widget.js?key=${XEELA_PUBLIC_TOKEN}`}
        strategy="lazyOnload"
      />
    </>
  );
}
