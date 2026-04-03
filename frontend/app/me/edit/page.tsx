"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
          router.push("/login");
          return;
        }

        const user: User | null = data?.data?.user ?? null;

        if (!user) {
          setMessage("No user found.");
          return;
        }

        setEmail(user.email ?? "");
        setDisplayName(user.display_name ?? "");
        setBio(user.bio ?? "");
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Failed to load user details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Updating profile...");

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/updatedetails",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            display_name: displayName,
            bio,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Failed to update profile");
        setIsSubmitting(false);
        return;
      }

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        router.push("/me");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Request failed while updating profile.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/me");
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>Edit Details</h1>

      {isLoading ? (
        <p>{message}</p>
      ) : (
        <>
          {message && <p>{message}</p>}

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}
          >
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Submit Changes"}
              </button>

              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
