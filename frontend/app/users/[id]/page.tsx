"use client";

// Import Link for client-side navigation between pages
import Link from "next/link";

// Import hooks for reading route params and redirecting users
import { useParams, useRouter } from "next/navigation";

// Import React hooks for local state and side effects
import { useEffect, useState } from "react";

// Public-safe user shape returned by GET /api/v1/users/:id
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

// API response shape for GET /api/v1/users/:id
interface GetUserByIdResponse {
  success: boolean;
  data?: {
    user: PublicUser;
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

// Single-user profile page component
export default function UserProfilePage() {
  // Get the dynamic route parameter from /users/[id]
  const params = useParams();

  // Router instance used for redirecting users when needed
  const router = useRouter();

  // Store the user returned from the backend
  const [user, setUser] = useState<PublicUser | null>(null);

  // Store the authenticated user's ID when a logged-in user is viewing the page
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Track whether this route should redirect to /me
  const [shouldRedirectToMe, setShouldRedirectToMe] = useState(false);

  // Store loading / error messages for the UI
  const [message, setMessage] = useState("Loading user profile...");

  // Track whether the page is still loading data
  const [isLoading, setIsLoading] = useState(true);

  // Track whether the request failed
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Normalize the dynamic route param into a single string ID
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // Stop early if the route param is missing
    if (!id) {
      setMessage("Invalid user id.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    // Fetch the public profile and optionally detect the authenticated user
    const loadUser = async () => {
      try {
        // Fetch the public user profile from the backend API
        const userRes = await fetch(
          `http://localhost:8000/api/v1/users/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        // Parse the public profile response body
        const userData: GetUserByIdResponse = await userRes.json();

        // Show an error if the public profile endpoint fails
        if (!userRes.ok) {
          setMessage(userData?.error || "Failed to load user profile.");
          setIsError(true);
          return;
        }

        // Safely read the single user object from the API response
        const fetchedUser = userData?.data?.user ?? null;

        // Show friendly message if no user is returned
        if (!fetchedUser) {
          setMessage("User not found.");
          setIsError(true);
          return;
        }

        // Try to fetch the currently authenticated user
        let authenticatedUserId: string | null = null;

        const meRes = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        // Only set currentUserId if the viewer is actually authenticated
        if (meRes.ok) {
          const meData: GetMeResponse = await meRes.json();

          // /auth/me returns { success, data: user: {} }
          authenticatedUserId = meData?.data?.user?.id ?? null;
          setCurrentUserId(authenticatedUserId);
        } else {
          // Public page should still work for unauthenticated visitors
          setCurrentUserId(null);
        }

        // Redirect authenticated users to /me if they are viewing their own profile
        if (authenticatedUserId && authenticatedUserId === fetchedUser.id) {
          setShouldRedirectToMe(true);
          return;
        }

        // Store returned user in component state
        setUser(fetchedUser);

        // Clear status message since data loaded successfully
        setMessage("");

        // Ensure error state is reset after successful load
        setIsError(false);
      } catch (error) {
        // Log unexpected errors for debugging
        console.error(error);

        // Show friendly fallback message in the UI
        setMessage("Failed to load user profile.");

        // Mark page as errored
        setIsError(true);
      } finally {
        // Stop loading spinner/message regardless of request outcome
        setIsLoading(false);
      }
    };

    // Invoke the async loader whenever the route id changes
    loadUser();
  }, [params.id]);

  useEffect(() => {
    if (shouldRedirectToMe) {
      router.replace("/me");
    }
  }, [shouldRedirectToMe, router]);

  // Prevent this page from rendering while redirecting to /me
  if (shouldRedirectToMe) {
    return null;
  }

  // Show loading state before rendering the profile
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-4 text-base text-gray-700">{message}</p>
        </section>
      </main>
    );
  }

  // Show error state before rendering the profile
  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-4 text-base text-red-600">{message}</p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/users"
              className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Back to All Users
            </Link>

            {currentUserId && (
              <Link
                href="/me"
                className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
              >
                Back to My Profile
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Viewing a public profile loaded from the database.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/users"
              className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Back to All Users
            </Link>

            {currentUserId && (
              <Link
                href="/me"
                className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
              >
                Back to My Profile
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Display Name</p>
            <p className="mt-1 text-base text-gray-900">
              {user?.display_name || "N/A"}
            </p>
          </div>

          {/* Users viewing a user's profile do NOT need to see that user's email 
            Note to self: Think about it, X nor TikTok share your email with 
            people that view your page or follow you. lol */}
          {/* <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-base text-gray-900">
              {user?.email || "N/A"}
            </p>
          </div> */}

          <div className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-sm font-medium text-gray-500">Bio</p>

            <p className="mt-1 text-base text-gray-900">{user?.bio || "N/A"}</p>

            {/* Vulnerable render for XSS demo only:
             This directly injects stored HTML into the DOM and can execute malicious script payloads. */}
            {/* <div
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
              dangerouslySetInnerHTML={{ __html: user?.bio || "N/A" }}
            /> */}
          </div>
        </div>
      </section>
    </main>
  );
}
