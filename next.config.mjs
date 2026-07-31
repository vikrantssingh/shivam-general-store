/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qhsdbbumuxnenrtcmlqx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
