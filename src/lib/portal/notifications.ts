interface PortalEmailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Provider-ready email delivery. It stays disabled unless the environment
 * explicitly selects Resend and supplies its server-side credentials.
 */
export async function sendPortalEmail(input: PortalEmailInput) {
  if (process.env.PORTAL_EMAIL_MODE !== "resend" || !process.env.PORTAL_EMAIL_API_KEY || !process.env.PORTAL_EMAIL_FROM) {
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PORTAL_EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.PORTAL_EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
