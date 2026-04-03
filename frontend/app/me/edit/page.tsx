"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/page-container";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";

type User = {
  email: string;
  display_name?: string | null;
  bio?: string | null;
};

export default function EditMePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("Loading user details...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data?.error || "Unauthorized");
          setIsError(true);
          router.push("/login");
          return;
        }

        const user: User | null = data?.data?.user ?? null;

        if (!user) {
          setMessage("No user found.");
          setIsError(true);
          return;
        }

        setEmail(user.email ?? "");
        setDisplayName(user.display_name ?? "");
        setBio(user.bio ?? "");
        setMessage("");
        setIsError(false);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load user details.");
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // Handle profile update form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Set submitting state and show loading message
    setIsSubmitting(true);
    setMessage("Updating profile...");
    setIsError(false);

    try {
      // Retrieve stored CSRF token from session storage
      const csrfToken = sessionStorage.getItem("csrfToken");

      // Ensure CSRF token exists before making request
      if (!csrfToken) {
        setMessage("CSRF token missing. Please log in again.");
        setIsError(true);
        setIsSubmitting(false);
        return;
      }

      // Send PATCH request to update user profile
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/updatedetails",
        {
          // Use PATCH method for partial updates
          method: "PATCH",

          // Include authentication cookie (JWT)
          credentials: "include",

          // Set headers including CSRF token for protection
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },

          // Send updated user fields in request body
          body: JSON.stringify({
            email,
            display_name: displayName,
            bio,
          }),
        }
      );

      // Parse JSON response from backend
      const data = await res.json();

      // Handle failed update request
      if (!res.ok) {
        setMessage(data?.error || "Failed to update profile.");
        setIsError(true);
        setIsSubmitting(false);
        return;
      }

      // Show success message after successful update
      setMessage("Profile updated successfully.");
      setIsError(false);

      // Redirect user back to profile page after short delay
      setTimeout(() => {
        router.push("/me");
      }, 1000);
    } catch (error) {
      // Handle network or unexpected errors
      console.error(error);
      setMessage("Request failed while updating profile.");
      setIsError(true);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/me");
  };

  return (
    <PageContainer>
      <Card
        title="Edit Profile"
        description="Update your profile details for this demo account."
      >
        {isLoading ? (
          <Alert message={message} type={isError ? "error" : "success"} />
        ) : (
          <div className="space-y-4">
            {message ? (
              <Alert message={message} type={isError ? "error" : "success"} />
            ) : null}

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
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Submit Changes"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
