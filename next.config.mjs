import withPWA from "next-pwa";

const pwaConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Empty turbopack config silences the warning when webpack plugins are used
    turbopack: {},
};

export default pwaConfig(nextConfig);
