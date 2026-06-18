export function Banner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-accent bg-accent/5 text-accent"
      : "border-green-600 bg-green-50 text-green-700";
  return (
    <div className={`border-l-2 px-3 py-2 text-sm ${styles}`} role="status">
      {children}
    </div>
  );
}
