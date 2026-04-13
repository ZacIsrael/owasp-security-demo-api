import { InputHTMLAttributes } from "react";

// Extends native HTML input props while adding reusable label/error support
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

// Reusable form input component with built-in label and validation messaging
export default function Input({ label, error, id, ...props }: Props) {
  return (
    // Groups label, input, and validation message with consistent vertical spacing
    <div className="space-y-2">
      {/* Associates visible label text with the input via matching htmlFor/id */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Spread native input props for flexible reuse across input variants */}
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      {/* Render validation/error message only when an error exists */}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
