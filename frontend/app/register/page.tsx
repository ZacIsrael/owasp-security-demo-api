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
  // Next.js router for client-side navigation after successful registration
  const router = useRouter();

  // Stores the user's email input value
  const [email, setEmail] = useState("");

  // Stores the user's password input value
  const [password, setPassword] = useState("");

  // Stores the user's chosen display name
  const [displayName, setDisplayName] = useState("");

  // Stores the user's bio input text
  const [bio, setBio] = useState("");

  // Stores status/error/success messages displayed to the user
  const [message, setMessage] = useState("");

  // Tracks whether the current message represents an error state
  const [isError, setIsError] = useState(false);

  // Tracks whether the registration request is currently in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle registration form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e; // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Disable repeated submissions while request is processing
    setIsSubmitting(true);

    // Show loading message while registration request is in progress
    setMessage("Creating account...");

    // Reset error state before attempting registration
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
