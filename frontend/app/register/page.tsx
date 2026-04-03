"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/page-container";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Creating account...");
    setIsError(false);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || data?.message || "Registration failed.");
        setIsError(true);
        setIsSubmitting(false);
        return;
      }

      setMessage("Registration successful. Redirecting to login...");
      setIsError(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Request failed.");
      setIsError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card
        title="Register"
        description="Create an account to test the authentication flow in the security demo."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="displayName"
            type="text"
            label="Display Name"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDisplayName(e.target.value)
            }
            required
          />

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio
            </label>

            <textarea
              id="bio"
              placeholder="Tell us a little about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
          />

          {message ? (
            <Alert message={message} type={isError ? "error" : "success"} />
          ) : null}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-6">
          <Link href="/login" className="block">
            <Button type="button" variant="secondary" fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
