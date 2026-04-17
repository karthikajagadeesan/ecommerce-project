import Sidebar from "@/components/sidebar/sidebar";
import MobileNavbar from "@/components/sidebar/mobile-navbar";
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <MobileNavbar userName={userName} />
      <Sidebar userName={userName} />
      <main className="flex-1 overflow-y-auto  md:mt-2 md:m-2 md:ml-0 px-4 md:px-3 py-4 md:rounded-lg md:border md:border-ui-muted h-[calc(100vh-64px)] md:h-[calc(100vh-16px)] bg-card overflow-x-hidden">
        <div className="mx-auto h-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
