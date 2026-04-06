"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/page-container";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";

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

        const fetchedUser = data?.data?.user ?? null;
        setUser(fetchedUser);
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

  // Handle user logout and invalidate session
  const handleLogout = async () => {
    // Show loading message while logout request is in progress
    setMessage("Logging out...");

    // Reset error state before attempting logout
    setIsError(false);

    try {
      // Retrieve stored CSRF token from session storage
      const csrfToken = sessionStorage.getItem("csrfToken");

      // Ensure CSRF token exists before making request
      if (!csrfToken) {
        setMessage("CSRF token missing. Please log in again.");
        setIsError(true);
        return;
      }

      // Send POST request to logout endpoint
      const res = await fetch("http://localhost:8000/api/v1/auth/logout", {
        // Use POST method for logout action
        method: "POST",

        // Include authentication cookie (JWT)
        credentials: "include",

        // Attach CSRF token header for verification
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      // Parse JSON response from backend
      const data = await res.json();

      // Handle failed logout attempt
      if (!res.ok) {
        setMessage(data?.error || "Logout failed.");
        setIsError(true);
        return;
      }

      // Remove CSRF token from session storage after logout
      sessionStorage.removeItem("csrfToken");

      // Redirect user to login page after successful logout
      router.push("/login");
    } catch (error) {
      // Handle network or unexpected errors
      console.error(error);

      // Show error message to user
      setMessage("Request failed while logging out.");

      // Set error state for UI feedback
      setIsError(true);
    }
  };

  return (
    <PageContainer>
      <Card
        title="My Profile"
        description="View your public profile details for this demo account."
      >
        {isLoading ? (
          <Alert message={message} type="success" />
        ) : user ? (
          <div className="space-y-6">
            {message ? (
              <Alert message={message} type={isError ? "error" : "success"} />
            ) : null}

            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-medium text-gray-500">
                  Display Name
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {user.display_name || "N/A"}
                </p>
              </div>

              {/* Safe render; avoid XSS */}
              {/* <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-medium text-gray-500">Bio</p>
                <p className="mt-1 text-base text-gray-900">
                  {user.bio || "N/A"}
                </p>
              </div> */}

              {/* Vulnerable to XSS; un-safe rendering */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-medium text-gray-500">Bio</p>

                {!user.bio ? (
                  <p className="mt-1 text-base text-gray-900">N/A</p>
                ) : (
                  <div
                    className="mt-1 text-base text-gray-900"
                    dangerouslySetInnerHTML={{ __html: user.bio }}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                fullWidth
                onClick={() => router.push("/me/edit")}
              >
                Edit Details
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        ) : (
          <Alert message={message || "No user found."} type="error" />
        )}
      </Card>
    </PageContainer>
  );
}
