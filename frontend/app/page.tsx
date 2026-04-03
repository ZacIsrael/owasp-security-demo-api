"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", textAlign: "center" }}>
      <h1>Security Demo App</h1>
      <p>OWASP Security Practices Demo</p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button onClick={() => router.push("/login")}>
          Go to Login
        </button>

        <button onClick={() => router.push("/register")}>
          Go to Register
        </button>
      </div>
    </main>
  );
}