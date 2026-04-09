// Enable client-side rendering for this component
"use client";

// Import Next.js Link for client-side navigation
import Link from "next/link";

// Import React hooks for state and lifecycle management
import { useEffect, useState } from "react";

// Import Next.js navigation hooks
import { usePathname, useRouter } from "next/navigation";

// Define the shape of an authenticated user object
interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
}

// Define the expected response structure from /auth/me endpoint
interface GetMeResponse {
  success: boolean;
  data?: {
    user: AuthenticatedUser;
  };
  error?: string;
}

// Navbar component responsible for top-level navigation
export default function Navbar() {
  // Router instance for programmatic navigation
  const router = useRouter();

  // Current route pathname (used for conditional UI logic)
  const pathname = usePathname();

  // State to track the currently authenticated user
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  // State to track whether auth check is still loading
  const [isLoading, setIsLoading] = useState(true);

  // Hide login/register buttons on auth-related pages
  const hideAuthActions =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  // Dynamically set brand link based on auth state
  const brandHref = user ? "/me" : "/";

  // Run auth check whenever route changes
  useEffect(() => {
    // Function to fetch current user from backend
    const loadUser = async () => {
      try {
        // Set loading state before making request
        setIsLoading(true);

        // Call backend /auth/me to get current session user
        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        // If request fails, clear user state
        if (!res.ok) {
          setUser(null);
          return;
        }

        // Parse JSON response
        const data: GetMeResponse = await res.json();

        // Safely extract user object from response
        const fetchedUser = data?.data?.user ?? null;

        // Update user state
        setUser(fetchedUser);
      } catch (err) {
        // Log error and reset user state
        console.error(err);
        setUser(null);
      } finally {
        // Stop loading regardless of success/failure
        setIsLoading(false);
      }
    };

    // Trigger user fetch on route change
    loadUser();
  }, [pathname]);

  // Handle user logout action
  const handleLogout = async () => {
    try {
      // Retrieve CSRF token from session storage
      const csrfToken = sessionStorage.getItem("csrfToken");

      // Send logout request to backend
      await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      // Clear CSRF token from browser storage
      sessionStorage.removeItem("csrfToken");

      // Reset user state after logout
      setUser(null);

      // Redirect user to login page
      router.push("/login");

      // Refresh router to update UI state
      router.refresh();
    } catch (err) {
      // Log any logout errors
      console.error(err);
    }
  };

  // Render navigation bar UI
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        {/* Left side navigation links */}
        <div className="flex items-center gap-8">
          {/* Brand link (route depends on auth state) */}
          <Link
            href={brandHref}
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Security App
          </Link>

          {/* Public users page link */}
          <Link
            href="/users"
            className="text-xl font-medium text-slate-500 transition hover:text-slate-800"
          >
            All Users
          </Link>

          {/* Show profile link only if user is authenticated */}
          {user && (
            <Link
              href="/me"
              className="rounded-xl bg-slate-900 px-6 py-3 text-xl font-semibold text-white"
            >
              My Profile
            </Link>
          )}
        </div>

        {/* Right side auth actions */}
        {!hideAuthActions && (
          <div>
            {/* Show login button only if not loading and no user */}
            {!isLoading && !user && (
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 px-8 py-3 text-xl font-semibold text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {/* Show logout button only if authenticated */}
            {!isLoading && user && (
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-8 py-3 text-xl font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
