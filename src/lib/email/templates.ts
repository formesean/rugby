const BASE = {
  bg: "#ffffff",
  fg: "#0f0f10",
  muted: "#888898",
  border: "#e8e8ec",
  primary: "#0f0f10",
  primaryFg: "#fafafa",
  card: "#ffffff",
};

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BASE.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${BASE.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:${BASE.fg};letter-spacing:-0.02em;">rugby</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:${BASE.card};border:1px solid ${BASE.border};border-radius:8px;padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:13px;color:${BASE.muted};">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
    <tr>
      <td style="background-color:${BASE.primary};border-radius:6px;">
        <a href="${url}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:${BASE.primaryFg};text-decoration:none;border-radius:6px;">${label}</a>
      </td>
    </tr>
  </table>
  <p style="margin:0;font-size:13px;color:${BASE.muted};">
    Or copy this link into your browser:<br />
    <a href="${url}" style="color:${BASE.muted};word-break:break-all;">${url}</a>
  </p>`;
}

export function verifyEmailTemplate(url: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BASE.fg};letter-spacing:-0.02em;">Verify your email</h1>
    <p style="margin:0 0 4px;font-size:15px;color:${BASE.muted};">Click the button below to verify your email address and activate your account.</p>
    ${ctaButton(url, "Verify email address")}
    <p style="margin:16px 0 0;font-size:13px;color:${BASE.muted};">This link expires in 24 hours.</p>
  `;
  return layout("Verify your email address", body);
}

export function resetPasswordTemplate(url: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BASE.fg};letter-spacing:-0.02em;">Reset your password</h1>
    <p style="margin:0 0 4px;font-size:15px;color:${BASE.muted};">We received a request to reset the password for your account. Click the button below to choose a new password.</p>
    ${ctaButton(url, "Reset password")}
    <p style="margin:16px 0 0;font-size:13px;color:${BASE.muted};">This link expires in 1 hour. If you didn't request a password reset, no action is needed.</p>
  `;
  return layout("Reset your password", body);
}
