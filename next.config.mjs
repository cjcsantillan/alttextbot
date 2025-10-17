/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small — only the traced
  // production dependencies get copied in, not the full node_modules.
  output: "standalone",
};

export default nextConfig;
