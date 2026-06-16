import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Канонический хост — голый домен. Любой заход на www.zharkyn.design
      // постоянным редиректом (308) уводим на zharkyn.design с тем же путём.
      // Условие по host матчит только www, поэтому петли нет (apex не совпадает),
      // а localhost/preview-домены не затрагиваются.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.zharkyn.design" }],
        destination: "https://zharkyn.design/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
