import Sidebar from "@/components/sidebar/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || "";
  
  if (user && !userName) {
    const { data: profile } = (await supabase
      .from('profiles')
      .select('name')
      .eq('auth_user_id', user.id)
      .single()) as { data: { name: string } | null };
    if (profile?.name) userName = profile.name;
  }
  
  userName = userName || "User";

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar userName={userName} />
      <main className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="mx-auto h-full max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
