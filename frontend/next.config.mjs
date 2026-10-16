/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Don't advertise the framework in every response ("X-Powered-By: Next.js").
  poweredByHeader: false,

  // gzip/brotli for HTML and JS responses when Next serves them itself.
  compress: true,

  // Only bundle the icons / animation helpers that are actually imported
  // (smaller JS on every page).
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Modern image formats for any next/image used later (smaller files on phones).
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Small, safe security headers on every page. Static JS/CSS under /_next/static already
  // get long-lived immutable caching from Next.js, so nothing to add there.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
