interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "high" | "medium" | "low";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-gray-100 text-gray-700",
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
