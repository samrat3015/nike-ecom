/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Enables static export for SSG
  trailingSlash: true, // Adds trailing slashes to URLs (optional, for compatibility with some hosts)
  images: {
    unoptimized: true, // Disables image optimization for static export (required for `output: 'export'`)
  },
};

export default nextConfig;