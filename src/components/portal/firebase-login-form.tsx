"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/integrations/firebase-client";
import { PortalField, PortalMessage } from "@/components/portal/portal-ui";

export function FirebaseLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    try {
      const credential = await signInWithEmailAndPassword(getFirebaseClientAuth(), email.trim(), password);
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/portal/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) throw new Error("Unable to create a portal session.");
      window.location.assign("/portal/dashboard");
    } catch {
      setError("The email or password is incorrect, or this account is not enabled for the portal.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <PortalMessage error={error} />
      <PortalField label="Email" name="email" type="email" placeholder="owner@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <PortalField label="Password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="submit" disabled={pending} className="action-primary disabled:cursor-wait disabled:opacity-60">{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
