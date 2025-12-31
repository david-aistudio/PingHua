import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: false, 
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  // Matikan Turbopack experimental key karena udah default atau bikin warning
  // experimental: { turbo: {} }, 
  
  // Puppeteer wajib external di serverless
  serverExternalPackages: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],

  optimizeFonts: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPWA(nextConfig);
