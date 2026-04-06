/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
