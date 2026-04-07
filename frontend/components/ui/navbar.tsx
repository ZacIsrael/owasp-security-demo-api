"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Authenticated user shape
interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
}

// /auth/me response shape
interface GetMeResponse {
  success: boolean;
  data?: {
    user: AuthenticatedUser;
  };
  error?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Track whether user is logged in
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  // Track loading state for auth-aware navbar actions
  const [isLoading, setIsLoading] = useState(true);

  // Hide auth action buttons on pages that already provide them
  const hideAuthActions =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("http://localhost:8000/api/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data: GetMeResponse = await res.json();
        const fetchedUser = data?.data?.user ?? null;

        setUser(fetchedUser);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Re-check auth whenever the route changes so navbar stays in sync
    loadUser();
  }, [pathname]);

  // Logout handler
  const handleLogout = async () => {
    try {
      const csrfToken = sessionStorage.getItem("csrfToken");

      await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      sessionStorage.removeItem("csrfToken");
      setUser(null);

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            Security App
          </Link>

          <Link
            href="/users"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/users"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            All Users
          </Link>

          {user && (
            <Link
              href="/me"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === "/me"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              My Profile
            </Link>
          )}
        </div>

        {/* Right side */}
        {!hideAuthActions && (
          <div className="flex items-center gap-3">
            {!isLoading && !user && (
              <Link
                href="/login"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
              >
                Login
              </Link>
            )}

            {!isLoading && user && (
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
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
