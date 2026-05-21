import * as Sentry from "@sentry/nextjs";
import type { Breadcrumb } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [Sentry.replayIntegration()],
  beforeSend(event) {
    if (process.env.NODE_ENV === "production") {
      const values = event.breadcrumbs?.values;
      if (Array.isArray(values)) {
        (values as Breadcrumb[]).forEach((b) => {
          if (b.data?.body) delete b.data.body;
          if (typeof b.data?.url === "string") {
            b.data.url = b.data.url.replace(/email=[^&]+/, "email=[redacted]");
          }
        });
      }
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
