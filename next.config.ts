import type { NextConfig } from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
let basePath = '';
let assetPrefix = '';

if (isGithubActions && !process.env.CUSTOM_DOMAIN) {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'teddy_pups_clone';
  basePath = `/${repo}`;
  assetPrefix = `/${repo}/`;
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: assetPrefix || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;

