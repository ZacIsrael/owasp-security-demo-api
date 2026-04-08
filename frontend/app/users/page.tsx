"use client";

// Import Link for client-side navigation between pages
import Link from "next/link";

// Import React hooks for local state and side effects
import { useEffect, useState } from "react";

// Public-safe user shape returned by GET /api/v1/users
interface PublicUser {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  created_at: string;
}

// Safe authenticated user shape returned by GET /api/v1/auth/me
interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API response shape for GET /api/v1/users
interface GetAllUsersResponse {
  success: boolean;
  data?: {
    users: PublicUser[];
    count: number;
  };
  error?: string;
}

// API response shape for GET /api/v1/auth/me
interface GetMeResponse {
  success: boolean;
  data?: {
    user: AuthenticatedUser;
  };
  error?: string;
}

// Users page component
export default function UsersPage() {
  // Store all users returned from the backend
  const [users, setUsers] = useState<PublicUser[]>([]);

  // Store the authenticated user's ID when a logged-in user is viewing the page
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Store loading / error / empty-state messages for the UI
  const [message, setMessage] = useState("Loading users...");

  // Track whether the page is still loading data
  const [isLoading, setIsLoading] = useState(true);

  // Track whether the users request failed
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Fetch all public users and optionally detect the authenticated user
    const loadUsers = async () => {
      try {
        // Fetch the public users list from the backend API
        const usersRes = await fetch("http://localhost:8000/api/v1/users", {
          method: "GET",
          credentials: "include",
        });

        // Parse the users response body
        const usersData: GetAllUsersResponse = await usersRes.json();

        // Show an error if the public users endpoint fails
        if (!usersRes.ok) {
          setMessage(usersData?.error || "Failed to load users.");
          setIsError(true);
          return;
        }

        // Safely read the users array from the API response
        const fetchedUsers = usersData?.data?.users ?? [];

        // Try to fetch the currently authenticated user
        const meRes = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        // Only set currentUserId if the viewer is actually authenticated
        if (meRes.ok) {
          const meData: GetMeResponse = await meRes.json();
          const authenticatedUserId = meData?.data?.user?.id ?? null;
          setCurrentUserId(authenticatedUserId);
        } else {
          // Public page should still work for unauthenticated visitors
          setCurrentUserId(null);
        }

        // Show friendly message if no users are found
        if (fetchedUsers.length === 0) {
          setUsers([]);
          setMessage("No users found.");
          setIsError(false);
          return;
        }

        // Store returned users in component state
        setUsers(fetchedUsers);

        // Clear message since data loaded successfully
        setMessage("");

        // Ensure error state is reset after successful load
        setIsError(false);
      } catch (error) {
        // Log unexpected errors for debugging
        console.error(error);

        // Show friendly fallback message in the UI
        setMessage("Failed to load users.");

        // Mark page as errored
        setIsError(true);
      } finally {
        // Stop loading spinner/message regardless of request outcome
        setIsLoading(false);
      }
    };

    // Invoke the async loader once when the page mounts
    loadUsers();
  }, []);

  // Show loading / error / empty states before rendering the users list
  if (isLoading || message) {
    return (
      // Center content vertically and horizontally on the page
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        {/* Card container for loading / status messages */}
        <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md">
          {/* Page heading */}
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>

          {/* Status message shown during loading / error / empty results */}
          <p
            className={`mt-4 text-base ${
              isError ? "text-red-600" : "text-gray-700"
            }`}
          >
            {message}
          </p>

          {/* Only show this link when a logged-in user is viewing the page */}
          {currentUserId && (
            <div className="mt-6">
              <Link
                href="/me"
                className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Back to My Profile
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    // Main page wrapper
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      {/* Center page content with a max width */}
      <section className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        {/* Header row with page title and optional navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Page heading */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>

            {/* Small helper text below the title */}
            <p className="mt-1 text-sm text-gray-600">
              Browse user profiles stored in the database.
            </p>
          </div>

          {/* Only show this link when the viewer is authenticated */}
          {currentUserId && (
            <Link
              href="/me"
              className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Back to My Profile
            </Link>
          )}
        </div>

        {/* Users list container */}
        <div className="mt-8 space-y-4">
          {/* Render one card per user */}
          {users.map((user) => (
            // Individual user card
            <article
              key={user.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-5"
            >
              {/* Top row with user info and profile link */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* User identity block */}
                <div>
                  {/* Display the user's visible name */}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user.display_name}
                  </h2>

                  {/* Real social media apps do not share a user's email unless the user 
                  explicityly tells them to do so (i.e. contact button on instagram) */}
                  {/* <p className="mt-1 text-sm text-gray-600">{user.email}</p> */}

                  {/* No need to show the bio here; Real social media app do not do this.
                  The post they'd show is the username and display name. Also, leaving this 
                  out works better for the demo because the victim user can't see the attacker's
                  bio that contains malicious javascript before they click it */}
                  {/* <p className="mt-3 text-sm text-gray-800">
                    {user.bio?.trim() ? user.bio : "No bio provided."}
                  </p> */}
                </div>

                {/* Route authenticated users to /me when clicking their own profile */}
                <Link
                  href={user.id === currentUserId ? "/me" : `/users/${user.id}`}
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
