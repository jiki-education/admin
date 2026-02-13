import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0d40645c04b46d65a3d28b8783e2d4d8@o4510766458601472.ingest.de.sentry.io/4510879887065168",
  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: 0.1,

  enableLogs: true,

  sendDefaultPii: true
});
