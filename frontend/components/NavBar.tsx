import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 0L7.5 4H12L8.5 6.5L10 10.5L6 8L2 10.5L3.5 6.5L0 4H4.5L6 0Z"
                fill="#C6E030"
              />
            </svg>
          </div>
          <span className="font-sans font-semibold text-primary text-sm tracking-tight">
            Lead Qualifier
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-5">
            <Link
              href="/history"
              className="text-xs text-muted hover:text-primary transition-colors font-medium"
            >
              History
            </Link>
            <span className="text-xs text-muted hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <span className="text-xs text-muted">v1.0</span>
        )}
      </div>
    </header>
  );
}
