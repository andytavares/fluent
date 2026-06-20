/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@fluent/ui"],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:3001"}/trpc/:path*`,
      },
      {
        source: "/api/stream/:token*",
        destination: `${process.env.SANDBOX_URL ?? "http://localhost:3002"}/stream/:token*`,
      },
    ];
  },
};

export default nextConfig;
