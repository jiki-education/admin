import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The dev servers and E2E tests run on local.jiki.io, which Next.js blocks by default.
  allowedDevOrigins: ["local.jiki.io"],
  webpack(config) {
    // SVG support with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js"
      }
    }
  }
};

let config: NextConfig = nextConfig;

if (process.env.NODE_ENV === "production") {
  config = withSentryConfig(nextConfig, {
    org: "thalamus-ai",
    project: "jiki-admin",
    silent: !process.env.CI,
    widenClientFileUpload: true,

    webpack: {
      // Disable server-side auto-instrumentation for Cloudflare Workers compatibility
      autoInstrumentServerFunctions: false,
      autoInstrumentMiddleware: false,
      autoInstrumentAppDirectory: false,
      automaticVercelMonitors: false,
      treeshake: {
        removeDebugLogging: true
      }
    }
  });
}

export default config;
