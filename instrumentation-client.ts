if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require("@sentry/nextjs");

  Sentry.init({
    dsn: "https://0d40645c04b46d65a3d28b8783e2d4d8@o4510766458601472.ingest.de.sentry.io/4510879887065168",

    integrations: [Sentry.replayIntegration()],

    tracesSampleRate: 0.1,

    enableLogs: true,

    replaysSessionSampleRate: 0.1,

    replaysOnErrorSampleRate: 1.0,

    sendDefaultPii: true
  });
}

export const onRouterTransitionStart =
  process.env.NODE_ENV === "production"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@sentry/nextjs").captureRouterTransitionStart
    : () => {};
