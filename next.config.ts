import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseapp.com https://*.googleapis.com https://*.gstatic.com https://apis.google.com",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firestore.app wss://*.firestore.app https://apis.google.com",
              "img-src 'self' data: https://*.googleusercontent.com https://*.googleapis.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "frame-src 'self' https://*.firebaseapp.com",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
}

export default nextConfig
