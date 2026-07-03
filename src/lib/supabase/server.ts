import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TimeoutError, withTimeout } from "@/lib/with-timeout";

const AUTH_TIMEOUT_MS = 5000;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS, "auth.getUser");
    return user;
  } catch (error) {
    if (error instanceof TimeoutError) return null;
    throw error;
  }
}
