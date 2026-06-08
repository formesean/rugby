type EnvSpec = {
  name: string;
  required: boolean;
  feature?: string;
};

const ENV_SPECS: EnvSpec[] = [
  { name: "DATABASE_URL", required: true, feature: "Database" },
  { name: "BETTER_AUTH_SECRET", required: true, feature: "Auth" },
  { name: "BASE_URL", required: true, feature: "Auth origin" },
  { name: "NEXT_PUBLIC_BASE_URL", required: true, feature: "Public origin" },
  { name: "RESEND_API_KEY", required: false, feature: "Email (Resend)" },
  { name: "RESEND_FROM_EMAIL", required: false, feature: "Email sender" },
  { name: "NEXT_PUBLIC_SENTRY_DSN", required: false, feature: "Error tracking (Sentry)" },
  { name: "SENTRY_AUTH_TOKEN", required: false, feature: "Sentry source maps" },
  { name: "SENTRY_ORG", required: false, feature: "Sentry org" },
  { name: "SENTRY_PROJECT", required: false, feature: "Sentry project" },
];

const color = (code: number, text: string) =>
  process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text;
const green = (t: string) => color(32, t);
const yellow = (t: string) => color(33, t);
const red = (t: string) => color(31, t);

export function reportEnvStatus() {
  if (process.env.NEXT_RUNTIME === "edge" || process.env.__RUGBY_ENV_REPORTED) return;
  process.env.__RUGBY_ENV_REPORTED = "1";

  const rows = ENV_SPECS.map((spec) => {
    const set = Boolean(process.env[spec.name]?.trim());
    let status: string;
    if (set) {
      status = green("● connected");
    } else if (spec.required) {
      status = red("● missing  ");
    } else {
      status = yellow("○ disabled ");
    }
    return { spec, set, status };
  });

  const pad = Math.max(...ENV_SPECS.map((s) => s.name.length));
  const missingRequired = rows.filter((r) => r.spec.required && !r.set);

  const lines = [
    "─".repeat(pad + 34),
    `${"env startup configuration"}`,
    "─".repeat(pad + 34),
    ...rows.map(
      ({ spec, status }) => `  ${status}  ${spec.name.padEnd(pad)}  ${spec.feature ?? ""}`,
    ),
    "─".repeat(pad + 34),
  ];

  console.log(lines.join("\n"));

  if (missingRequired.length > 0) {
    console.log(
      red(
        `  ✗ ${missingRequired.length} required variable(s) missing: ${missingRequired
          .map((r) => r.spec.name)
          .join(", ")}`,
      ),
    );
  }
}
