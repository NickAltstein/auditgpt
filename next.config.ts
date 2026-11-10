import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    // 2026-08 redesign: auditgpt.ai now hosts the real SMB claim-review front
    // door itself (see /, /pricing, /snapshot, /auditgpt, /sample-report,
    // /how-it-works, /trust) instead of bouncing visitors to scrutexity.com.
    // PENDING NICK'S SIGN-OFF: scrutexity.com is a real, separately deployed
    // site (confirmed live during this build) — disabling this redirect
    // changes where its traffic goes. Do not deploy this file's redirects
    // change without that confirmation. /agency stays redirected until its
    // replacement page ships.
    return [
      { source: "/agency", destination: "https://scrutexity.com/partners", permanent: false },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
