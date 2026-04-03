"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/page-container";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Logging in...");
    setIsError(false);

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
        setMessage(data?.error || "Login failed.");
        setIsError(true);
        return;
      }

      setMessage("Login successful. Redirecting...");
      setIsError(false);
      router.push("/me");
    } catch (error) {
      setMessage("Request failed.");
      setIsError(true);
      console.error(error);
    }
  };

  return (
    <PageContainer>
      <Card
        title="Login"
        description="Sign in to access your profile and continue the security demo."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message ? (
            <Alert message={message} type={isError ? "error" : "success"} />
          ) : null}

          <Button type="submit" fullWidth>
            Log In
          </Button>
        </form>

        <div className="mt-6">
          <Link href="/register" className="block">
            <Button type="button" variant="secondary" fullWidth>
              Go to Register
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
