import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Разрешённые origin для dev-сервера (доступ к /_next/* при заходе
  // не только с localhost, но и с 127.0.0.1 / IP в сети / через туннель).
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.8.0.4",
    "*.devtunnels.ms",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.loca.lt",
  ],
  experimental: {
    // Server Actions проверяют, что Origin запроса совпадает с хостом.
    // За туннелем/прокси публичный домен отличается от localhost — его нужно
    // явно разрешить, иначе POST экшенов (вход, сохранение сорта) отклоняется.
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "10.8.0.4:3000",
        "*.devtunnels.ms",
        "*.trycloudflare.com",
        "*.ngrok-free.app",
        "*.loca.lt",
      ],
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
