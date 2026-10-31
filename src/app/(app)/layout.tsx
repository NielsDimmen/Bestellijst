import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-bg text-text">
          <div className="h-[60px] border-b border-line px-4" />
          <main className="flex flex-1 flex-col" />
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    const jar = await cookies();
    // Route handler can Set-Cookie; Server Components cannot.
    if (jar.get(SESSION_COOKIE)?.value) {
      redirect("/api/auth/logout");
    }
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-bg text-text">
      <AppHeader name={user.name} isAdmin={user.isAdmin} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
