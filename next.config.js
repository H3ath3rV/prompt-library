/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  output: "export",
  distDir: "dist",
  images: { unoptimized: true }
};

export default nextConfig;
