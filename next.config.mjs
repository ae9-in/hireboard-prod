/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:category-jobs-in-:city',
        destination: '/jobs-category/:category/:city',
      },
    ];
  },
};

export default nextConfig;
