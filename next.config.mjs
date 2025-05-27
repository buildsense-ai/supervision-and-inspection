/** @type {import('next').NextConfig} */
const nextConfig = {
  // 设置基础路径为 /web
  basePath: '/web',
  
  // 设置资源前缀
  assetPrefix: '/web',
  
  // 启用严格模式
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 输出配置
  output: 'standalone',
  
  // 图片优化配置
  images: {
    unoptimized: true, // 如果使用 Nginx 处理静态资源
  },
  
  // 重写规则（如果需要）
  async rewrites() {
    return [
      {
        source: '/web/:path*',
        destination: '/:path*',
      },
    ]
  },
}

export default nextConfig
