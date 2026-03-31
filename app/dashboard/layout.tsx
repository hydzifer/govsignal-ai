import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { hasClerkEnv } from "@/lib/env";

const navItems = [
  { label: "Today", href: "/dashboard", icon: "📋" },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: "👁" },
  { label: "Archive", href: "/dashboard/archive", icon: "📁" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasClerkEnv()) {
    redirect("/");
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">GovSignal AI</h1>
          <p className="mt-1 text-xs text-gray-500">AI Policy Monitor</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <UserButton />
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
