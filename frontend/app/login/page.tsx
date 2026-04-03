"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Login failed");
        return;
      }

      setMessage("Login successful. Redirecting...");
      router.push("/me");
    } catch (error) {
      setMessage("Request failed.");
      console.error(error);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Login Demo</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Log In</button>
      </form>

      <p>{message}</p>
      <div style={{ marginTop: "1rem" }}>
        <button type="button" onClick={() => router.push("/register")}>
          Go to Register
        </button>
      </div>
    </main>
  );
}
