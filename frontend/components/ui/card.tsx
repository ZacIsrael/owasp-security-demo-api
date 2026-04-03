import { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function Card({ title, description, children }: CardProps) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      {title ? (
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}

      <div className="mt-6">{children}</div>
    </section>
  );
}
