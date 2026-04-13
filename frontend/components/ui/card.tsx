import { ReactNode } from "react";

// Props for configuring reusable card content and optional header text
type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

// Reusable styled container for auth/forms/content sections across the UI
export default function Card({ title, description, children }: CardProps) {
  return (
    // Main card wrapper with consistent spacing, border, and shadow styling
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* Render title heading only when provided */}
      {title ? (
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      ) : null}

      {/* Render supporting description text only when provided */}
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}

      {/* Render nested React elements/components passed into the Card */}
      <div className="mt-6">{children}</div>
    </section>
  );
}
