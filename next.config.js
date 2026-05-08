/** @type {import('next').NextConfig} */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' + 'unsafe-eval' required for Next.js runtime + dev HMR.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // data: for inline SVGs/icons; blob: for generated PDFs; supabase for Storage avatars.
      "img-src 'self' data: blob: https://*.supabase.co",
      // blob: for SOS recording playback in the admin dashboard.
      "media-src 'self' blob:",
      // Supabase REST + Realtime; Anthropic + Voyage are server-side only but
      // listed defensively in case future browser-side use is added.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.voyageai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      // Global security headers — applied to every response.
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      // Service worker: keep its specific headers. Listed AFTER the global
      // entry so its values take precedence on conflicts (none today, but
      // safe for the future).
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
