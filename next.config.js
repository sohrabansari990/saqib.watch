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
            // Primary: subdomain with reverse proxy (HTTPS)
            {
                protocol: 'https',
                hostname: 'images.saqib.watch',
                port: '',
                pathname: '/images/**',
            },
            // Fallback: direct IP access (HTTP, port 8080)
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
