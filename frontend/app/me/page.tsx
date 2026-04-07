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
  // Initialize Next.js router for client-side navigation
  const router = useRouter();

  // Store the authenticated user object (or null if not loaded)
  const [user, setUser] = useState<User | null>(null);

  // Message displayed to the user (loading, success, or error)
  const [message, setMessage] = useState("Loading user details...");

  // Track whether user data is still being fetched
  const [isLoading, setIsLoading] = useState(true);

  // Track if an error occurred during data fetching
  const [isError, setIsError] = useState(false);

  // Fetch authenticated user data when component mounts
  useEffect(() => {
    // Async function to retrieve user from backend
    const loadUser = async () => {
      try {
        // Send GET request to protected /auth/me endpoint with cookies
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        // Parse JSON response from backend
        const data = await res.json();

        // Handle unauthorized or failed response
        if (!res.ok) {
          setMessage(data?.error || "Unauthorized");
          setIsError(true);

          // Redirect user to login if not authenticated
          router.push("/login");
          return;
        }

        // Safely extract user object from response
        const fetchedUser = data?.data?.user ?? null;

        // Store user in state
        setUser(fetchedUser);

        // Clear any previous messages
        setMessage("");

        // Reset error state
        setIsError(false);
      } catch (error) {
        // Log unexpected errors (network/server issues)
        console.error(error);

        // Display generic failure message
        setMessage("Failed to load user details.");

        // Set error state for UI feedback
        setIsError(true);
      } finally {
        // Stop loading state regardless of success or failure
        setIsLoading(false);
      }
    };

    // Invoke function to fetch user data
    loadUser();

    // Dependency ensures router is available for redirects
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
              {/* React automatically escapes user input when rendering with JSX,
              so any HTML/JS in user.bio is treated as text (preventing XSS). */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-medium text-gray-500">Bio</p>
                <p className="mt-1 text-base text-gray-900">
                  {user.bio || "N/A"}
                </p>
              </div>
              
              {/* Vulnerable to XSS; un-safe rendering */}
              {/* <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-medium text-gray-500">Bio</p>

                {!user.bio ? (
                  <p className="mt-1 text-base text-gray-900">N/A</p>
                ) : (
                  <div
                    className="mt-1 text-base text-gray-900"
                    // Using dangerouslySetInnerHTML bypasses React's default HTML escaping,
                    // allowing raw HTML injection into the DOM (potential XSS risk).
                    // Only use it when content is:
                    // 1) Trusted, or
                    // 2) Strictly sanitized on the backend
                    //
                    // Common valid use cases:
                    // - CMS-rendered content (e.g., blog posts)
                    // - Markdown converted to HTML
                    // - Rich text editors (Quill, TinyMCE)
                    //
                    // Never use with unsanitized user input.
                    dangerouslySetInnerHTML={{ __html: user.bio }}
                  />
                )}
              </div> */}
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
