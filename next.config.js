/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '64.227.191.172',
                port: '8080',
                pathname: '/images/**',
            },
        ],
    },
};

module.exports = nextConfig;
