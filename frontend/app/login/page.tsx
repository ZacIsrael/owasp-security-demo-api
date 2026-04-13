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
  // Next.js router for client-side navigation after successful login
  const router = useRouter();

  // Stores the user's email input value
  const [email, setEmail] = useState("");

  // Stores the user's password input value
  const [password, setPassword] = useState("");

  // Stores status/error/success messages displayed to the user
  const [message, setMessage] = useState("");

  // Tracks whether the current message represents an error state
  const [isError, setIsError] = useState(false);

  // Handle login form submission and authenticate user
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Show loading message while request is in progress
    setMessage("Logging in...");

    // Reset error state before attempting login
    setIsError(false);

    try {
      // Send login request to backend with user credentials
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        // Use POST method for authentication
        method: "POST",

        // Include cookies (JWT token) in request/response
        credentials: "include",

        // Set request headers for JSON payload
        headers: {
          "Content-Type": "application/json",
        },

        // Send email and password in request body
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Parse JSON response from backend
      const data = await res.json();

      // Handle unsuccessful login attempt
      if (!res.ok) {
        // Display error message from server or fallback message
        setMessage(data?.error || "Login failed.");

        // Set error state for UI feedback
        setIsError(true);

        // Stop execution if login failed
        return;
      }

      // Ensure CSRF token is returned from backend
      if (!data?.csrfToken) {
        // Show error if token is missing (should not happen)
        setMessage("Login failed: CSRF token was not returned.");

        // Set error state for UI feedback
        setIsError(true);

        // Stop execution if token is missing
        return;
      }

      // Store CSRF token in session storage for
      // future state-changing (POST, PATCH, PUT, DELETE) requests
      sessionStorage.setItem("csrfToken", data.csrfToken);

      // Show success message before redirect
      setMessage("Login successful. Redirecting...");

      // Clear any previous error state
      setIsError(false);

      // Redirect user to profile page after login
      router.push("/me");
    } catch (error) {
      // Handle network or unexpected errors
      setMessage("Request failed.");

      // Set error state for UI feedback
      setIsError(true);

      // Log error for debugging purposes
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
