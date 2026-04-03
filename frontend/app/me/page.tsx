"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  display_name?: string | null;
  bio?: string | null;
};

export default function MePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Loading user details...");
  const [isLoading, setIsLoading] = useState(true);

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

        const fetchedUser = data?.data?.user ?? null;
        setUser(fetchedUser);
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

  const handleLogout = async () => {
    setMessage("Logging out...");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Logout failed");
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
      setMessage("Request failed while logging out.");
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>User Details</h1>

      {isLoading ? (
        <p>{message}</p>
      ) : user ? (
        <>
          {message && <p>{message}</p>}

          <div style={{ marginBottom: "2rem" }}>
            <p>
              <strong>Display Name:</strong> {user.display_name || "N/A"}
            </p>
            <p>
              <strong>Bio:</strong> {user.bio || "N/A"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" onClick={() => router.push("/me/edit")}>
              Edit Details
            </button>

            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </>
      ) : (
        <p>{message || "No user found."}</p>
      )}
    </main>
  );
}
