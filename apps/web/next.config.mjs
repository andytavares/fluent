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
    ];
  },
};

export default nextConfig;
