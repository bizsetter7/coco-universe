import type { NextConfig } from "next";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react/display-name": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
];
ignoreBuildErrors: true,
  },
eslint: {
  ignoreDuringBuilds: true,
  },

export default nextConfig;
