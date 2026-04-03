type Props = {
  message: string;
  type?: "error" | "success";
};

export default function Alert({ message, type = "error" }: Props) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  );
}
