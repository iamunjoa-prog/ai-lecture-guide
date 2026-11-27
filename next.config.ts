import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 3분 이론은 용어집의 '3분 이론' 탭으로 옮겼다. ?l= 같은 쿼리는 그대로 붙고,
      // 해시(#<개념 id>)는 브라우저가 이어 붙여 용어집 탭이 그 개념을 연다.
      { source: "/theory", destination: "/glossary?tab=theory", permanent: true },
    ];
  },
};

export default nextConfig;
