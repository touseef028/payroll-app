/** @type {import('next').NextConfig} */
 
const nextConfig = {
    experimental: {
      ppr: 'incremental',
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'dev-optopro.s3.eu-west-2.amazonaws.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
  };
   
  export default nextConfig;

  