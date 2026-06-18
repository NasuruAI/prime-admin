/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Product thumbnails come from Cloudinary as pre-transformed URLs.
  images: { unoptimized: true },
};
export default nextConfig;
