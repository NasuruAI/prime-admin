export function Banner({
  tone,
  children,
}: {
  tone: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<typeof tone, string> = {
    error: "border-accent bg-accent/5 text-accent",
    success: "border-green-600 bg-green-50 text-green-700",
    warning: "border-amber-500 bg-amber-50 text-amber-700",
    info: "border-primary bg-primary/5 text-primary",
  };
  return (
    <div
      className={`border-l-2 px-3.5 py-2.5 text-sm ${styles[tone]}`}
      role="status"
    >
      {children}
    </div>
  );
}
